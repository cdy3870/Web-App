class User(object):
    def __init__(self, id, password='', email='', first_name='', last_name=''):
        self.password = password
        self.email = email
        self.first_name = first_name
        self.last_name = last_name
        self.id = id

    def to_dict(self):
        return {'password': self.password, 'email': self.email, 'first_name': self.first_name, 'last_name': self.last_name}

