from google.cloud import datastore

 datastore_client = datastore.Client()

 kind = 'WhateverYouLike'

 # Come up with some ID; alternatively datastore can generate one for you. Note: generated IDs are numeric.
 name = 'sampletask1'

 # Create some a datastore key for your entity
 task_key = datastore_client.key(kind, name)

 # You can give it some parameters
 task = datastore.Entity(key=task_key)
 task['description'] = 'Buy milk'

 # Save the entity
 datastore_client.put(task)
