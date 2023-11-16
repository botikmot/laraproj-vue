import Pusher from 'pusher-js';

const pusher = new Pusher('ac2ac0d32e1504c35bc1', {
    cluster: 'ap1',
    encrypted: true,
});
pusher.connection.bind('connected', () => {
    console.log('Pusher connected');
});

pusher.connection.bind('error', (error) => {
    console.error('Pusher connection error:', error);
});

export default pusher;
