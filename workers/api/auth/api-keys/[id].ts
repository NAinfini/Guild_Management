/**
 * API Key Management - Individual Key
 * DELETE /auth/api-keys/:id - Revoke API key
 */

import { createEndpoint } from '../../../lib/endpoint-factory';

interface RevokeResponse {
  success: true;
  message: string;
}

/**
 * DELETE /auth/api-keys/:id - Revoke API key
 */
export const onRequestDelete = createEndpoint<RevokeResponse>({
  auth: 'required',
  handler: async ({ env, user, params }) => {
    const keyId = params.id;

    if (!keyId) {
      throw new Error('API key ID is required');
    }

    // Check if key exists and belongs to user
    const existingKey = await env.DB.prepare(
      `SELECT key_id, user_id, is_active FROM api_keys WHERE key_id = ?`
    )
      .bind(keyId)
      .first();

    if (!existingKey) {
      throw new Error('API key not found');
    }

    if (existingKey.user_id !== user!.user_id) {
      throw new Error('You can only revoke your own API keys');
    }

    if (existingKey.is_active === 0) {
      throw new Error('API key is already revoked');
    }

    // Soft delete: set is_active = 0
    await env.DB.prepare(
      `UPDATE api_keys SET is_active = 0 WHERE key_id = ?`
    )
      .bind(keyId)
      .run();

    return {
      success: true,
      message: 'API key revoked successfully',
    };
  },
});
