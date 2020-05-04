import mail from '../../lib/mail';

class DeliveryManCanceledMail {
  get key() {
    return 'deliverymanCanceledMail';
  }

  async handle({ data }) {
    const { deliveryman, order } = data;

    console.log('fila executou');

    await mail.sendMail({
      to: `${deliveryman.name} <${deliveryman.email}>`,
      subject: 'Canceled Order',
      template: 'canceledorder',
      context: {
        deliveryman: deliveryman.name,
        order: order.product,
      },
    });
  }
}

export default new DeliveryManCanceledMail();
