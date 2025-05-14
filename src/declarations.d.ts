import { Dependencies as InfrastructureDependencies } from '@/modules';
import { JsonSchemaToTsProvider } from '@fastify/type-provider-json-schema-to-ts';
import {
  FastifyBaseLogger,
  FastifyInstance,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
} from 'fastify';

declare global {
  // Declare global DI container type
  // type Dependencies = InfrastructureDependencies;
  interface Dependencies extends InfrastructureDependencies {}
  // Ensures HTTP request is strongly typed from the schema
  type FastifyRouteInstance = FastifyInstance<
    RawServerDefault,
    RawRequestDefaultExpression<RawServerDefault>,
    RawReplyDefaultExpression<RawServerDefault>,
    FastifyBaseLogger,
    JsonSchemaToTsProvider
  >;
}

declare module 'fastify' {
  interface FastifyInstance {
    /**
     * Verifies a Bearer JWT on the incoming request,
     * and if valid attaches { id, email } to request.user
     */
    authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void>;
  }

  interface FastifyRequest {
    /** Set by authenticate() */
    user?: {
      id: string;
      email: string;
    };

    /** Set by fastify-awilix */
    container: {
      cradle: Dependencies;
    };
  }
}

// Strongly Type DI container
declare module '@fastify/awilix' {
  interface Cradle extends Dependencies {}

  interface RequestCradle extends Dependencies {}
}

declare module '@fastify/request-context' {
  interface RequestContextData {
    requestId: string;
  }
}
