class Item(object):
    def __init__(self, id, title='', weekly_price=0):
        self.title = title
        self.weekly_price = weekly_price
        self.id = id

    def to_dict(self):
        return {'title': self.title, 'quantity': self.weekly_price}
