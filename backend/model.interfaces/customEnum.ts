enum gender{
    'male',
    'female',
    'kids',
    'unisex'
}
enum level{
    'gender',
    'main',
    'sub'
}

enum offerType{
    'percentage',
    'fixed',
    'bogo',
    'freeShipping'
}

enum role{
    'user',
    'admin'
}

enum paymentMethod{
    'cod', 'card', 'upi', 'netbanking'
}

enum paymentStatus{
    'pending', 'paid', 'failed', 'refunded'
}
enum orderStatus{
    'pending',
      'confirmed',
      'shipped',
      'out_for_delivery',
      'delivered',
      'cancelled',
      'returned'
}
export {gender, level, offerType, role,paymentMethod, paymentStatus, orderStatus}