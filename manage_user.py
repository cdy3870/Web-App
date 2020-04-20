from google.cloud import datastore
from user import User

IT_ENTITY_TYPE = 'User'

def log(msg):
    print('userdata: %s' % msg)

def get_client():
    return datastore.Client()

def load_key(client, kind, item_id=None):
    
    if item_id:
        key = client.key(kind, int(item_id))
    else:
        key = client.key(kind)
    
    return key

def convert_to_object(entity):
    user_id = entity.key.id_or_name
    return User(user_id, entity['password'], entity['email'], entity['first_name'], entity['last_name'])

def load_entity(client, item_id):
    """Load a datstore entity using a particular client, and the ID."""
    key = load_key(client, IT_ENTITY_TYPE, item_id)
    entity = client.get(key)
    log('retrieved entity for ' + item_id)
    return entity

def load_entity_kind(client, item_id, kind):
    """Load a datstore entity using a particular client, and the ID."""
    key = load_key(client, kind, item_id)
    entity = client.get(key)
    log('retrieved entity for ' + item_id)
    return entity

def get_list_items(kind):
    """Retrieve the list items we've already stored."""
    client = get_client()
    # we build a query
    query = client.query(kind=kind)
    query.add_filter('rented', '=', False)
    # we execute the query
    items = list(query.fetch())

    # the code below converts the datastore entities to plain old objects -
    # this is good for decoupling the rest of our app from datastore.
    result = list()
    for item in items:
        result.append(convert_to_object(item))
    
    log('list retrieved. %s items' % len(result))
    return result

def create_list_item(user):
    client = get_client()
    key = load_key(client, IT_ENTITY_TYPE)
    user.id = key.id_or_name
    entity = datastore.Entity(key)
    entity['password'] = user.password
    entity['email'] = user.email
    entity['first_name'] = user.first_name
    entity['last_name'] = user.last_name
    client.put(entity)
    log('saved new entity for ID: %s' % key.id_or_name)

def get_passhash(username):
    client = get_client()
    query = client.query(kind=IT_ENTITY_TYPE)
    query.add_filter('email', '=', username)
    if len(list(query.fetch())) == 0:
        return ""
    return list(query.fetch())[0]['password']

def get_own_data(username):
    client = get_client()
    query = client.query(kind='User')
    query.add_filter('email', '=', username)
    user = list(query.fetch())  

    # the code below converts the datastore entities to plain old objects -
    # this is good for decoupling the rest of our app from datastore.
    result = list()
    result.append(convert_to_object(user[0]))
    
    #log('list retrieved. %s items' % len(result))
    return result

"""def edit_list_item(item_id, kind):
    client = get_client()
    key = load_key(client, kind)
    entity = load_entity(client, item_id)

    for prop in entity:
        entity[prop] = entity[prop]
    entity['rented'] = True
    client.put(entity)
    #print(client.get(key)['rented'])
    

def get_list_item(item_id):
    #Retrieve an object for the ShoppingListItem with the specified ID.
    client = get_client()
    log('retrieving object for ID: %s' % item_id)
    entity = load_entity(client, item_id)
    return convert_to_object(entity)

def save_list_item(shopping_list_item):
    #Save an existing list item from an object.
    client = get_client()
    entity = load_entity(client, shopping_list_item.id)
    entity.update(shopping_list_item.to_dict())
    client.put(entity)
    log('entity saved for ID: %s' % shopping_list_item.id)

def delete_list_item(item_id, kind):
    #Delete the entity associated with the specified ID.
    client = get_client()
    key = load_key(client, kind, item_id)
    log('key loaded for ID: %s' % item_id)
    client.delete(key)
    log('key deleted for ID: %s' % item_id)"""