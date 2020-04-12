class Item(object):
    def __init__(self, id, title='', daily_price=0, weekly_price=0, monthly_price=0, 
                description='', retail_price=0, kind='', 
                rented=False, rentee='', past_rented=False, 
                category = '', location = ''):
        #self.renter = renter
        self.title = title
        self.daily_price = daily_price
        self.weekly_price = weekly_price
        self.monthly_price = monthly_price
        self.description = description
        self.retail_price = retail_price
        self.kind = kind
        self.rented = rented
        self.rentee = rentee
        self.past_rented = past_rented
        self.category = category
        self.location = location
        self.id = id

    def to_dict(self):
        return {'title': self.title, 
                'daily_price': self.daily_price, 'weekly_price': self.weekly_price, 'monthly_price': self.monthly_price, 
                'description': self.description, 'retail_price': self.retail_price, 'kind': self.kind, 
                'rented': self.rented, 'rentee': self.rentee, 'past_rented': self.past_rented, 
                'category': self.category, 'location': self.location}

