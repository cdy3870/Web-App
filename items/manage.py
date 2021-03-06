from google.cloud import datastore, storage
from items.item import Item

IT_ENTITY_TYPE = 'Item'

def log(msg):
    print('itemdata: %s' % msg)

def get_client():
    return datastore.Client()

def load_key(client, kind, item_id=None):
    
    if item_id:
        key = client.key(kind, int(item_id))
    else:
        key = client.key(kind)
    
    return key

def convert_to_object(entity):
    item_id = entity.key.id_or_name
    
    return Item(item_id, entity['title'], entity['daily_price'], entity['weekly_price'], entity['monthly_price'], entity['description'], 
                entity['retail_price'], entity['kind'], entity['rented'], entity['rentee'], entity['renter'], entity['past_rented'], entity['category'], entity['location'],
                entity['blob_url'])

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

def get_list_items(kind, username, history):
    """Retrieve the list items we've already stored."""
    client = get_client()
    # we build a query
    query = client.query(kind=kind)
    filtered_items = []
    if kind == 'Item':
        query.add_filter('rented', '=', False)
        items = list(query.fetch()) 
        print(items) 
        if items is not None:
            filtered_items = [item for item in items if item["renter"] != username]
        else:
            filtered_items = items

    if kind == 'RentedItem':
        query.add_filter('rentee', '=', username)
        if history == 'true':
            #print("loading history")
            query.add_filter('past_rented', '=', True)
        else:
            #print("loading rented items")
            query.add_filter('past_rented', '=', False)
        filtered_items = list(query.fetch())
    
    # the code below converts the datastore entities to plain old objects -
    # this is good for decoupling the rest of our app from datastore.
    result = list()
    if filtered_items is not None:
        for item in filtered_items:
            result.append(convert_to_object(item))
    
    #log('list retrieved. %s items' % len(result))
    return result

def get_list_items_user(kind, username, history):
    """Retrieve the list items we've already stored."""
    client = get_client()
    # we build a query
    query = client.query(kind=kind)

    query.add_filter("renter", '=', username)
    query.add_filter("rented", '=', False)
    # we execute the query
    items = list(query.fetch())

    

    # the code below converts the datastore entities to plain old objects -
    # this is good for decoupling the rest of our app from datastore.
    result = list()
    for item in items:
        result.append(convert_to_object(item))
    
    #log('list retrieved. %s items' % len(result))
    return result

def get_list_items_query(kind, username, location, category, daily_price_range):
    """Retrieve the list items we've already stored."""
    client = get_client()
    query = client.query(kind=kind)
    query.add_filter('rented', '=', False)

    if kind == 'Item':
        if location != 'all' and category != 'all':
            query.add_filter('location', '=', location)
            query.add_filter('category', '=', category)
        elif location != 'all' and category == 'all':
            query.add_filter('location', '=', location)
        elif location == 'all' and category != 'all':
            query.add_filter('category', '=', category)

    items = list(query.fetch())

    result = list()
    for item in items:
        if item['renter'] != username:
            result.append(convert_to_object(item))
    return result

def get_list_item(item_id, kind):
    """Retrieve an object for the ShoppingListItem with the specified ID."""
    client = get_client()
    log('retrieving object for ID: %s' % item_id)
    entity = load_entity_kind(client, item_id, kind)
    return convert_to_object(entity)

def create_list_item(item, kind):
    client = get_client()
    key = load_key(client, item.kind)
    item.id = key.id_or_name
    entity = datastore.Entity(key)
    #entity['renter'] = item.renter
    entity['title'] = item.title
    entity['daily_price'] = int(item.daily_price)
    entity['weekly_price'] = int(item.weekly_price)
    entity['monthly_price'] = int(item.monthly_price)
    entity['description'] = item.description
    entity['retail_price'] = item.retail_price
    entity['kind'] = item.kind
    entity['rented'] = item.rented
    entity['rentee'] = item.rentee
    entity['renter'] = item.renter
    entity['past_rented'] = item.past_rented
    entity['category'] = item.category
    entity['location'] = item.location
    entity['blob_url'] = item.blob_url
    client.put(entity)
    log('saved new entity for ID: %s' % key.id_or_name)

def edit_list_item(item_id, kind):
    client = get_client()
    key = load_key(client, kind)
    entity = load_entity(client, item_id)

    for prop in entity:
        entity[prop] = entity[prop]
    entity['rented'] = True
    client.put(entity)
    #print(client.get(key)['rented'])
    



"""def save_list_item(shopping_list_item):
    #Save an existing list item from an object.
    client = get_client()
    entity = load_entity(client, shopping_list_item.id)
    entity.update(shopping_list_item.to_dict())
    client.put(entity)
    log('entity saved for ID: %s' % shopping_list_item.id)"""

def delete_list_item(item_id, kind):
    #Delete the entity associated with the specified ID.
    client = get_client()
    key = load_key(client, kind, item_id)
    log('key loaded for ID: %s' % item_id)
    client.delete(key)
    log('key deleted for ID: %s' % item_id)

def return_list_item(item_id, kind):
    #Delete the entity associated with the specified ID
    client = get_client()
    key = load_key(client, kind, item_id)
    entity = load_entity_kind(client, item_id, kind)
    for prop in entity:
        entity[prop] = entity[prop]
    entity['rented'] = False
    entity['past_rented'] = True
    client.put(entity)
    log('key deleted for ID: %s' % item_id)

def get_client_storage():
    return storage.Client()

def create_image_blob(uploaded_file, filename):
    print("creating image blob for: {}".format(filename))
    client = get_client_storage()
    bucket = client.get_bucket('web-app-267217.appspot.com')
    file_blob = bucket.blob(filename)
    file_blob.upload_from_string(uploaded_file.read(), content_type=uploaded_file.content_type)

    return file_blob.public_url