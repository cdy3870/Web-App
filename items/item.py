class Item(object):
    def __init__(self, id, title='', daily_price=0, weekly_price=0, monthly_price=0, description=''):
        self.title = title
        self.daily_price = daily_price
        self.weekly_price = weekly_price
        self.monthly_price = monthly_price
        self.description = description
        self.id = id

    def to_dict(self):
        return {'title': self.title, 'daily_price': self.daily_price, 'weekly_price': self.weekly_price, 'monthly_price': self.monthly_price, 'description': self.description}
