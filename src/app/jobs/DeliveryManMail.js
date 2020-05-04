import mail from '../../lib/mail';

class DeliveryManMail {
  get key() {
    return 'deliverymanMail';
  }

  async handle({ data }) {
    const { deliveryman, order, recipient } = data;

    console.log('fila executou');

    await mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'New Delivery',
      template: 'deliverydetail',
      context: {
        deliveryman: deliveryman.name,
        product: order.product,
        recipientName: recipient.name,
        address: `${recipient.street}, n°${recipient.number},${recipient.city}/${recipient.uf}`,
      },
    });
  }
}

export default new DeliveryManMail();
