from google.cloud import datastore
from items.item import Item

IT_ENTITY_TYPE = 'Item'

def log(msg):
    print('itemdata: %s' % msg)

def get_client():
    return datastore.Client()

def load_key(client, item_id=None):
    print(client)
    if item_id:
        key = client.key(IT_ENTITY_TYPE, int(item_id))
    else:
        key = client.key(IT_ENTITY_TYPE)
    
    return key

def convert_to_object(entity):
    item_id = entity.key.id_or_name
    return Item(item_id, entity['title'], entity['weekly_price'])

"""def delete_list_item(sli_id):
    #Delete the entity associated with the specified ID.
    client = get_client()
    key = load_key(client, sli_id)
    log('key loaded for ID: %s' % sli_id)
    client.delete(key)
    log('key deleted for ID: %s' % sli_id)"""

def create_list_item(item):
    client = get_client()
    key = load_key(client)
    item.id = key.id_or_name
    entity = datastore.Entity(key)
    entity['weekly_price'] = item.weekly_price
    entity['title'] = item.title
    client.put(entity)
    log('saved new entity for ID: %s' % key.id_or_name)

"""def save_list_item(shopping_list_item):
    #Save an existing list item from an object.
    client = get_client()
    entity = load_entity(client, shopping_list_item.id)
    entity.update(shopping_list_item.to_dict())
    client.put(entity)
    log('entity saved for ID: %s' % shopping_list_item.id)"""