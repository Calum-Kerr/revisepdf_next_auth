import { createClient } from '@/utils/supabase/server';
import { Tables } from '@/types_db';

type UserStorage = Tables<'user_storage'>;
type Subscription = Tables<'subscriptions'>;
type Product = Tables<'products'>;

export interface SubscriptionLimits {
  maxFileSize: number;
  totalStorageLimit: number;
  currentStorageUsed: number;
  canUpload: boolean;
  tierName: string;
}

export interface FileUploadValidation {
  canUpload: boolean;
  reason?: string;
  maxFileSize: number;
  availableStorage: number;
}

/**
 * Get user's current subscription limits and usage
 */
export async function getUserSubscriptionLimits(userId: string): Promise<SubscriptionLimits> {
  const supabase = createClient();
  
  // Get user's storage info
  const { data: storageData, error: storageError } = await supabase
    .from('user_storage')
    .select('*')
    .eq('id', userId)
    .single();

  if (storageError || !storageData) {
    // Return default limits if no storage record found
    return {
      maxFileSize: 10485760, // 10MB
      totalStorageLimit: 104857600, // 100MB
      currentStorageUsed: 0,
      canUpload: true,
      tierName: 'Basic'
    };
  }

  // Get user's active subscription to determine tier name
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select(`
      *,
      prices (
        *,
        products (*)
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  const tierName = subscription?.prices?.products?.name || 'Basic';

  return {
    maxFileSize: storageData.max_file_size_limit,
    totalStorageLimit: storageData.total_storage_limit,
    currentStorageUsed: storageData.total_storage_used,
    canUpload: storageData.total_storage_used < storageData.total_storage_limit,
    tierName
  };
}

/**
 * Validate if a user can upload a file of given size
 */
export async function validateFileUpload(
  userId: string, 
  fileSize: number
): Promise<FileUploadValidation> {
  const supabase = createClient();
  
  // Use the database function to check if user can upload
  const { data: canUpload, error } = await supabase
    .rpc('can_user_upload_file', {
      user_uuid: userId,
      file_size: fileSize
    });

  if (error) {
    return {
      canUpload: false,
      reason: 'Error checking upload permissions',
      maxFileSize: 0,
      availableStorage: 0
    };
  }

  // Get detailed limits for response
  const limits = await getUserSubscriptionLimits(userId);
  
  if (!canUpload) {
    let reason = 'Upload not allowed';
    
    if (fileSize > limits.maxFileSize) {
      reason = `File size (${formatBytes(fileSize)}) exceeds your plan limit of ${formatBytes(limits.maxFileSize)}`;
    } else if ((limits.currentStorageUsed + fileSize) > limits.totalStorageLimit) {
      reason = `Not enough storage space. Need ${formatBytes(fileSize)} but only ${formatBytes(limits.totalStorageLimit - limits.currentStorageUsed)} available`;
    }
    
    return {
      canUpload: false,
      reason,
      maxFileSize: limits.maxFileSize,
      availableStorage: limits.totalStorageLimit - limits.currentStorageUsed
    };
  }

  return {
    canUpload: true,
    maxFileSize: limits.maxFileSize,
    availableStorage: limits.totalStorageLimit - limits.currentStorageUsed
  };
}

/**
 * Update user's storage usage after successful file upload
 */
export async function updateStorageUsage(userId: string, fileSize: number): Promise<boolean> {
  const supabase = createClient();
  
  const { error } = await supabase
    .rpc('update_storage_usage', {
      user_uuid: userId,
      file_size: fileSize
    });

  return !error;
}

/**
 * Update user's storage limits based on their subscription
 */
export async function updateUserStorageLimits(userId: string, productName: string): Promise<boolean> {
  const supabase = createClient();
  
  const { error } = await supabase
    .rpc('update_storage_limits_for_subscription', {
      user_uuid: userId,
      product_name: productName
    });

  return !error;
}

/**
 * Get subscription tier information
 */
export function getSubscriptionTierInfo(tierName: string) {
  const tiers = {
    'Basic': {
      name: 'Basic',
      maxFileSize: 10485760, // 10MB
      totalStorage: 104857600, // 100MB
      price: '$9/month',
      features: ['Basic PDF processing', '10MB file limit', '100MB storage']
    },
    'Pro': {
      name: 'Pro',
      maxFileSize: 52428800, // 50MB
      totalStorage: 1073741824, // 1GB
      price: '$19/month',
      features: ['Advanced PDF processing', '50MB file limit', '1GB storage', 'Priority support']
    },
    'Enterprise': {
      name: 'Enterprise',
      maxFileSize: 104857600, // 100MB
      totalStorage: 10737418240, // 10GB
      price: '$49/month',
      features: ['Premium PDF processing', '100MB file limit', '10GB storage', 'Priority support', 'API access']
    }
  };

  return tiers[tierName as keyof typeof tiers] || tiers.Basic;
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Calculate storage usage percentage
 */
export function getStorageUsagePercentage(used: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((used / total) * 100);
}
