# Parse the Google Form HTML
import re
import json

# Let's inspect the fields from the html snippet provided in the prompt
# We can search for data-item-id, name="entry.xxx", aria-label, etc.
