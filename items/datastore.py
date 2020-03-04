from google.cloud import datastore
from item import Item

IT_ENTITY_TYPE = 'Item'

def log(msg):
    print('itemdata: %s' % msg)

def get_client():
    return datastore.Client()

def load_key(client, item_id=None):
    if item_id:
        key = client.key(IT_ENTITY_TYPE, int(item_id))
    else:
        key = client.key(IT_ENTITY_TYPE)
    
    return key

def convert_to_object(entity):
    item_id = entity.key.id_or_name
    return Item(item_id, entity['title'], entity['weekly_price'])

def create_list_item(item):
    client = get_client
    key = load_key(client)
    item.id = key.id_or_name
    entity = datastore.Entity(key)
    entity['weekly_price'] = item.weekly_price
    entity['title'] = item.title
    client.put(entity)
    log('saved new entity for ID: %s' % key.id_or_name)