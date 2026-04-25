import { getMQChannel } from '../config/rabbitmq.js';

// 🎯 Función auxiliar para emitir eventos
const publishEvent = async (exchange, routingKey, payload) => {
    let channel = null;
    try {
        channel = await getMQChannel();

        if (!payload) {
            throw new Error('El payload del evento no puede estar vacío');
        }

        const msg = JSON.stringify({ 
            ...payload, 
            timestamp: new Date().toISOString(),
            source: 'groups-service'
        });

        await channel.assertExchange(exchange, 'topic', {
            durable: true
        });

        const published = channel.publish(exchange, routingKey, Buffer.from(msg));

        if (published) {
            console.log(`✓ [RabbitMQ] Event emitted - Exchange: ${exchange}, Key: ${routingKey}`);
            console.log(`  Payload: ${msg}`);
        } else {
            console.warn('⚠ [RabbitMQ] Buffer full, message queued');
        }

        return true;
    } catch (error) {
        console.error(`✗ [RabbitMQ] Error emitting event (${routingKey}):`, error.message);
        throw error;
    }
};

// 👥 Evento: Grupo creado
export const emitGroupCreatedEvent = async (groupId, groupName, ownerId) => {
    try {
        await publishEvent(
            'groups_exchange',
            'group.created',
            {
                groupId,
                groupName,
                ownerId,
                type: 'GROUP_CREATED'
            }
        );
    } catch (error) {
        console.error('Error emitting group created event:', error);
        throw error;
    }
};

// ➕ Evento: Usuario invitado a grupo
export const emitUserInvitedEvent = async (groupId, groupName, userId, invitedUserId, invitedByUserId) => {
    try {
        await publishEvent(
            'groups_exchange',
            'group.user.invited',
            {
                groupId,
                groupName,
                userId: invitedUserId,
                invitedByUserId,
                type: 'USER_INVITED_TO_GROUP'
            }
        );
    } catch (error) {
        console.error('Error emitting user invited event:', error);
        throw error;
    }
};

// ✏️ Evento: Grupo actualizado
export const emitGroupUpdatedEvent = async (groupId, groupName, updatedByUserId, changes) => {
    try {
        await publishEvent(
            'groups_exchange',
            'group.updated',
            {
                groupId,
                groupName,
                updatedByUserId,
                changes,
                type: 'GROUP_UPDATED'
            }
        );
    } catch (error) {
        console.error('Error emitting group updated event:', error);
        throw error;
    }
};


// ❌ Evento: Grupo eliminado
export const emitGroupDeletedEvent = async (groupId, groupName, deletedByUserId) => {
    try {
        await publishEvent(
            'groups_exchange',
            'group.deleted',
            {
                groupId,
                groupName,
                deletedByUserId,
                type: 'GROUP_DELETED'
            }
        );
    } catch (error) {
        console.error('Error emitting group deleted event:', error);
        throw error;
    }
};

// 🎯 Evento heredado: Usuario creado (para compatibilidad)
export const emitCreateUserEvent = async (userId) => {
    let connection = null;
    let channel = null;
    try {

        const channel = await getMQChannel();

        if (!userId) {
            throw new Error('Se debe mandar el id del usuario que se conectó a RabbitMQ')
        }

        const exchange = 'auth_exchange';
        const key = 'user.created';
        const msg = JSON.stringify({ userId, timestamp: new Date().toISOString() })

        await channel.assertExchange(exchange, 'topic', {
            durable: true
        });

        const published = channel.publish(exchange, key, Buffer.from(msg));

        if (published) {
            console.log('✓ [RabbitMQ] Message emitted:', msg);
        } else {
            console.warn('⚠ [RabbitMQ] Buffer full, message queued');
        }

    } catch (error) {
        console.error('✗ [RabbitMQ] Error emitting user created event:', error.message);
        if (channel) await channel.close().catch(() => { });
        if (connection) await connection.close().catch(() => { });
        throw error;
    }
}