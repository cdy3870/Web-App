from google.cloud import datastore
from items.item import Item

IT_ENTITY_TYPE = 'Item'

def log(msg):
    print('itemdata: %s' % msg)

def get_client():
    return datastore.Client()

def load_key(client, item_id=None):
    
    if item_id:
        key = client.key(IT_ENTITY_TYPE, int(item_id))
    else:
        print("test")
        key = client.key(IT_ENTITY_TYPE)
    
    return key

def convert_to_object(entity):
    item_id = entity.key.id_or_name
    return Item(item_id, entity['title'], entity['weekly_price'])

def load_entity(client, item_id):
    """Load a datstore entity using a particular client, and the ID."""
    key = load_key(client, item_id)
    entity = client.get(key)
    log('retrieved entity for ' + item_id)
    return entity

def get_list_items():
    """Retrieve the list items we've already stored."""
    client = get_client()

    # we build a query
    query = client.query(kind=IT_ENTITY_TYPE)

    # we execute the query
    items = list(query.fetch())

    # the code below converts the datastore entities to plain old objects -
    # this is good for decoupling the rest of our app from datastore.
    result = list()
    for item in items:
        result.append(convert_to_object(item))

    log('list retrieved. %s items' % len(result))
    return result

def create_list_item(item):
    client = get_client()
    key = load_key(client)
    item.id = key.id_or_name
    entity = datastore.Entity(key)
    entity['weekly_price'] = item.weekly_price
    entity['title'] = item.title
    client.put(entity)
    print(client.get(load_key(client, item.id)))
    log('saved new entity for ID: %s' % key.id_or_name)

"""def save_list_item(shopping_list_item):
    #Save an existing list item from an object.
    client = get_client()
    entity = load_entity(client, shopping_list_item.id)
    entity.update(shopping_list_item.to_dict())
    client.put(entity)
    log('entity saved for ID: %s' % shopping_list_item.id)"""

"""def delete_list_item(sli_id):
    #Delete the entity associated with the specified ID.
    client = get_client()
    key = load_key(client, sli_id)
    log('key loaded for ID: %s' % sli_id)
    client.delete(key)
    log('key deleted for ID: %s' % sli_id)"""