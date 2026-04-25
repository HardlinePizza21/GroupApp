import { getMQChannel } from '../config/rabbitmq.js';
import prisma from '../config/db.js';

/**
 * 📡 SERVICIO DE GRUPOS - ESCUCHA DE EVENTOS
 * 
 * Este módulo escucha eventos de otros servicios (auth, backend, etc.)
 * y realiza acciones basadas en esos eventos.
 */

// =====================================
// 🔧 Función auxiliar para consumir eventos
// =====================================

const consumeEvent = async (exchange, routingKey, handler, queueName) => {
    let channel = null;
    try {
        channel = await getMQChannel();

        // Declarar exchange
        await channel.assertExchange(exchange, 'topic', { durable: true });

        // Crear cola
        const q = await channel.assertQueue(queueName, { durable: true });

        // Vincular cola al exchange con el routing key
        await channel.bindQueue(q.queue, exchange, routingKey);

        console.log(`✓ [RabbitMQ] Listening to ${exchange} -> ${routingKey} on queue ${q.queue}`);

        // Consumir mensajes
        await channel.consume(q.queue, async (msg) => {
            if (msg) {
                try {
                    const content = JSON.parse(msg.content.toString());
                    console.log(`📥 [RabbitMQ] Received event (${routingKey}):`, content);

                    // Ejecutar handler
                    await handler(content);

                    // Reconocer el mensaje
                    channel.ack(msg);
                } catch (error) {
                    console.error('Error processing event:', error.message);
                    // Rechazar el mensaje y reintentarlo
                    channel.nack(msg, false, true);
                }
            }
        });

    } catch (error) {
        console.error(`✗ [RabbitMQ] Error setting up consumer (${routingKey}):`, error.message);
        if (channel) await channel.close().catch(() => { });
        throw error;
    }
};

// =====================================
// 📡 EVENTOS A ESCUCHAR
// =====================================

/**
 * 📧 ESCUCHAR: Usuario eliminado en el servicio de auth
 * 
 * Caso de uso: Cuando un usuario es eliminado del sistema,
 * limpiar todos los grupos asociados
 */
export const listenToUserDeletedEvent = async () => {
    const handler = async (event) => {
        const { userId } = event;
        console.log(`🗑️ User deleted event received for userId: ${userId}`);
        
        try {
            // Remover al usuario de todos los grupos
            await prisma.groupMember.deleteMany({
                where: { userId }
            });

            console.log(`✓ User ${userId} removed from all groups`);
        } catch (error) {
            console.error('Error handling user deleted event:', error);
            throw error;
        }
    };

    await consumeEvent(
        'auth_exchange',
        'user.deleted',
        handler,
        'groups_user_deleted_queue'
    );
};


/**
 * 🔔 ESCUCHAR: Evento de presencia de usuario (online/offline)
 * 
 * Caso de uso: Actualizar estado de presencia de miembros del grupo
 */
export const listenToUserPresenceEvent = async () => {
    const handler = async (event) => {
        const { userId, status, groupId } = event; // status: 'online' | 'offline'
        console.log(`👁️ User ${userId} is now ${status} in group ${groupId}`);
        
        try {
            // Aquí podrías:
            // - Actualizar un campo de presencia en groupMember
            // - Notificar a otros miembros del grupo
            // - Registrar actividad
            
        } catch (error) {
            console.error('Error handling user presence event:', error);
            throw error;
        }
    };

    await consumeEvent(
        'backend_exchange',
        'user.presence.changed',
        handler,
        'groups_user_presence_queue'
    );
};

// =====================================
// 🚀 INICIALIZAR TODOS LOS LISTENERS
// =====================================

export const initializeEventListeners = async () => {
    try {
        console.log('🚀 Initializing event listeners for Groups Service...');

        // Escuchar todos los eventos
        await listenToUserDeletedEvent();
        await listenToUserPresenceEvent();

        console.log('✓ All event listeners initialized successfully');
    } catch (error) {
        console.error('✗ Error initializing event listeners:', error);
        throw error;
    }
};