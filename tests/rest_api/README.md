<!--
 Copyright (C) 2021 Intel Corporation

 SPDX-License-Identifier: MIT
-->

# Testing infrastructure for REST API v2.0

## Motivation

It was very annoying to support the testing infrastructure with FakeRedis,
unittest framework, hardcoded data in the code.
[DRF testing](https://www.django-rest-framework.org/api-guide/testing/)
approach works well only for a single server. But if you have a number
of microservices, it becomes really hard to implement reliable tests.
For example, CVAT consists of server itself, OPA, Redis, DB, Nuclio services.
Also it is worth to have a real instance with real data inside and tests
the server calling REST API directly (as it done by users).

## How to run?

Please look at documentation for [pytest](https://docs.pytest.org/en/6.2.x/).
Generally you have to install requirements and run the following command from
the root directory of the cloned CVAT repository:

```console
pip3 install --user -r tests/rest_api/requirements.txt
pytest tests/rest_api/
```

## How to upgrade testing assets?

When you have a new use case which cannot be expressed using objects already
available in the system like comments, users, issues, please use the following
procedure to add them:

1. Run a clean CVAT instance
1. Restore DB and data volume using commands below
1. Add new objects (e.g. issues, comments, tasks, projects)
1. Backup DB and data volume using commands below
1. Don't forget to dump new objects into corresponding json files inside
   assets directory
1. Commit cvat_data.tar.bz2 and cvat_db.sql into git. Be sure that they are
   small enough: ~200K-400K together.

It is recommended to use dummy and tiny images. You can generate them using
Pillow library. See a sample code below:

```python
from PIL import Image
from PIL.ImageColor import colormap, getrgb
from random import randint


for i, color in enumerate(colormap):
    size = (randint(100, 1000), randint(100, 1000))
    img = Image.new('RGB', size, getrgb(color))
    img.save(f'{i}.png')
```

To backup DB and data volume, please use commands below.

```console
docker exec -i cvat_db pg_dump -c -U root -d cvat > assets/cvat_db.sql
docker run --rm --volumes-from cvat ubuntu tar -cjv /home/django/data > assets/cvat_data.tar.bz2
```

To restore DB and data volume, please use commands below.

```console
cat assets/cvat_db.sql | docker exec -i cvat_db psql -q -U root -d cvat
cat assets/cvat_data.tar.bz2 | docker run --rm -i --volumes-from cvat ubuntu tar -xj --strip 3 -C /home/django/data
```

To dump an object into JSON, please look at the sample code below. You also
can find similar code in `utils/dump_objects.py` script. All users in the
testing system has the same password `!Q@W#E$R`.

```python
import requests
import json

with requests.Session() as session:
    session.auth = ('admin1', '!Q@W#E$R')

    for obj in ['user', 'project', 'task', 'job']:
        response = session.get(f'http://localhost:8080/api/v1/{obj}s')
        with open(f'{obj}s.json', 'w') as f:
            json.dump(response.json(), f, indent=2, sort_keys=True)
```

## FAQ

1. How to merge two DB dumps?

   It can be critical if several developers add new tests in parallel. But if
   you have json description of all objects together with cvat_db.sql, it will
   be possible to recreate them manually.

1. How to upgrade cvat_data.tar.bz2 and cvat_db.sql?

   After every commit which changes the layout of DB and data directory it is
   possible to break these files. But failed tests should be a clear indicator
   of that.

1. Should we use only json files to re-create all objects in the testing
   system?

   Construction of some objects can be complex and takes time (backup
   and restore should be much faster). Construction of objects in UI is more
   intuitive.
