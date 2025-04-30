const packEvent = (kind, data) => `event: ${kind}\ndata: ${data}\n\n`;

const packUnnamedEvent = (data) => `data: ${data}\n\n`;

export {
    packEvent,
    packUnnamedEvent
}