const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * Upload a buffer to Supabase Storage and return a signed URL (1 year expiry).
 * @param {Buffer} buffer
 * @param {string} bucket - 'payments' or 'reports'
 * @param {string} filename - e.g. 'payment_uuid.jpg'
 * @param {string} mimetype
 * @returns {Promise<string>} signed URL
 */
async function uploadToStorage(buffer, bucket, filename, mimetype) {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(filename, buffer, { contentType: mimetype, upsert: true });

  if (error) throw new Error(`Storage upload failed: ${error.message}`);

  const { data, error: urlError } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filename, 60 * 60 * 24 * 365);

  if (urlError) throw new Error(`Signed URL failed: ${urlError.message}`);

  return data.signedUrl;
}

/**
 * Delete a file from Supabase Storage.
 * @param {string} bucket
 * @param {string} filename
 */
async function deleteFromStorage(bucket, filename) {
  await supabase.storage.from(bucket).remove([filename]);
}

module.exports = { uploadToStorage, deleteFromStorage };
