
import { createEndpoint } from '../../../lib/endpoint-factory';
import { notFoundResponse, successResponse} from '../../../lib/utils'; // Assuming utilities are available

export const onRequestDelete = createEndpoint<void>({
  auth: 'admin', // Only admins can delete audit logs
  
  handler: async ({ env, params }) => {
    const id = params.id;

    const result = await env.DB
      .prepare('DELETE FROM audit_logs WHERE audit_id = ?')
      .bind(id)
      .run();

    if (result.meta.changes === 0) {
      return notFoundResponse('Audit Log'); 
    }

    return successResponse({ message: 'Audit log deleted successfully' });
  }
});
