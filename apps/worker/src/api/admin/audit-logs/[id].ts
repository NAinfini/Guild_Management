
import { createEndpoint } from '../../../core/endpoint-factory';
import { notFoundResponse, successResponse} from '../../../core/utils'; // Assuming utilities are available
import { getDb } from '../../../core/drizzle';
import { auditLog } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export const onRequestDelete = createEndpoint<void>({
  auth: 'admin', // Only admins can delete audit logs
  
  handler: async ({ env, params }) => {
    const id = params.id;
    const db = getDb(env);

    const result = await db.delete(auditLog).where(eq(auditLog.auditId, id)).run();

    if ((result.meta?.changes || 0) === 0) {
      return notFoundResponse('Audit Log'); 
    }

    return successResponse({ message: 'Audit log deleted successfully' });
  }
});
