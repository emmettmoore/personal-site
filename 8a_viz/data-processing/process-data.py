from __future__ import print_function
import sys
import cPickle
import os.path
import random

import ijson
import json
from pygeocoder import Geocoder

incorrect_locations = {
    "Gunks": [41.7475, -74.0794],
    "Yosemite": [37.8651, -119.5383],
    "Mazama": [48.5921, -120.4040],
    "Maple Canyon": [39.5554, -111.6777],
    "American Fork": [40.4336, -111.7391],
    "Indian creek": [40.6502, -111.3527],
    "Logan Canyon": [41.7402, -111.7938],
    "Rifle": [39.5448,-107.7849],
    "Clear Creek Canyon": [39.7527647,-105.2344],
    "Shelf Road": [38.7253276,-105.1727715],
    "Rat Cave": [45.51307, -122.61778],
    "Farley": [42.5972215,-72.446389],
}

def print_err(msg):
    print(msg, file=sys.stderr)

def softness(ascents, grade, crag):

    soft     = 0.
    fair     = 0.
    hard     = 0.
    total    = 0.
    fairness = 0.
    soft_comments = []
    hard_comments = []
    fair_comments = []
    for ascent in ascents:
        if not type(ascent) is dict:
            # print_err( "ERROR: ascent is a {}: {} in crag {}".format(type(ascent), ascent, crag ))
            continue

        asc_grade = ascent['grade']
        asc_comment = ascent['comment']

        if not asc_grade[0].isdigit():
            # print_err( "Not a real grade: {}".format(asc_grade) )
            continue

        # grades are lexicographically comparable 
        if asc_grade == grade:
            if asc_comment.startswith("Soft"):
                soft += 1
                if len(asc_comment) > 5:
                    soft_comments.append(asc_comment[3:])
            elif asc_comment.startswith("Hard"):
                hard += 1
                if len(asc_comment) > 5:
                    hard_comments.append(asc_comment[3:])
            else:
                fair += 1
                if len(asc_comment) > 1:
                    fair_comments.append(asc_comment)
        elif asc_grade < grade:
            if not asc_comment.startswith("Hard"):  
                soft += 1
            else:
                #print_err( ascent["climber"] + " is an idiot on " + ascent['route_name'] )
                fair += 1
        elif asc_grade > grade:
            hard += 1
        else:
            print_err( "INCONCEIVABLE!" )
            fair += 1
        # sum final stats
        total = soft+fair+hard
        if (soft - hard) == 0:
            fairness = 0.0
        elif (soft > hard):
            fairness = -1 * soft/total
        else:
            fairness = hard / total

    if soft_comments == []:
        soft_comments.append("")
    if hard_comments == []:
        hard_comments.append("")
    if fair_comments == []:
        fair_comments.append("")

    return {
        "soft": soft,
        "soft_comment": random.choice(soft_comments),
        "fair": fair,
        "fair_comment": random.choice(fair_comments),
        "hard": hard,
        "hard_comment": random.choice(hard_comments),
        "total": total,
        "fairness": fairness
    }


def cragsFromJson(dataPath):
    FAIR_THRESHOLD = 0.30
    cragsList = []
    crag_avg_fairness = 0.
    crag_total_fairness = 0.
    num_hard = 0
    num_soft = 0
    num_fair = 0
    total_ascents = 0
    with open(dataPath) as f:
        crags = ijson.items(f, 'crags.item')
        for crag in crags:
            # geocode the crag
            if 'location' in crag:
                location = crag['location']
                geocoded = Geocoder.geocode(location)
                print( "{} ({}) --> {}".format(crag['name'], crag['location'], geocoded) )
                if crag['name'] not in incorrect_locations:
                    crag["coordinates"] = geocoded[0].coordinates
                else:
                    crag["coordinates"] = incorrect_locations[crag['name']]
            else:
                crag['coordinates'] = None
            # merge routes with similar names
            route_keys = {}
            orig_name = {}
            to_del = []
            for i, route in enumerate(crag['route']):
                key_name = route['name'].replace(" ", "").replace("\'", "").replace("\"", "").lower()
                if key_name in route_keys.keys():
                    try:
                        print ("                                            Route {} already in list as {}".format(route['name'].encode('utf-8'), orig_name[key_name]))
                    except UnicodeEncodeError:
                        pass
                    if type(crag['route'][route_keys[key_name]]['ascents']) is list and type(route['ascents']) is list:
                        crag['route'][route_keys[key_name]]['ascents'].append(route['ascents'])
                        print
                        to_del = [i] + to_del
                else:
                    orig_name[key_name] = route['name']
                    route_keys[key_name] = i
            for i in to_del:
                del crag['route'][i]

            for route in crag['route']:
                # get softness of route
                route.update( softness(route['ascents'], route['grade'], crag['name'] ))
                total_ascents += len(route['ascents'])
                crag_total_fairness += route['fairness']
                # remove unneeded fields to reduce size of output
                for field in ['ascents', 'index', 'thumbs_up', 'f_os', 'crag']:
                    del route[field]

                if (route['total'] == 0):
                    pass
                    #print( "No ascents for {}".format(route['name'].encode('utf-8')) )
                else:
                    if route['fairness'] > FAIR_THRESHOLD:
                        num_hard+= 1;
                    elif route['fairness'] < (-1 * FAIR_THRESHOLD):
                        num_soft+= 1;
                    else:
                        num_fair+= 1;
                    num_routes =  num_fair + num_soft + num_hard
            crag['route'] = [route for route in crag['route'] if route['total'] > 0]
            crag['route'] = sorted(crag['route'], key=lambda k: k['fairness'])
            print("crag_total_fairness {}".format(crag_total_fairness))
            print("num_routes: {}".format(num_routes))
            print("num_soft: {}".format(num_soft))
            print("num_hard: {}".format(num_hard))
            print("num_fair: {}".format(num_fair))
            print("total_ascents: {}".format(total_ascents))
            crag_avg_fairness = crag_total_fairness / len(crag['route'])
            crag.update({"fairness": crag_avg_fairness, 'num_soft': num_soft, 'num_hard': num_hard, 'num_fair': num_fair, 'total_ascents': total_ascents})
            print("crag: {name}, fairness: {fairness}".format(**crag))
            # add total ascents for crag. Needed to calculate area's popularity

            # reset stat counters
            num_soft = 0
            num_hard = 0
            num_fair = 0
            crag_avg_fairness = 0.
            crag_total_fairness = 0.
            total_ascents = 0
            cragsList.append(crag)
        # filter out areas we don't have geo locations for
        cragsList = [crag for crag in cragsList if crag['coordinates'] != None] 
        # filter out areas that don't have at least 750 ascents
        cragsList = [crag for crag in cragsList if crag['total_ascents'] > 750] 
    return cragsList

def cragsFromPickle(dataPath):
    with open(dataPath) as f:
        unpickler = cPickle.Unpickler(f)
        cragsList = unpickler.load()
    return cragsList
        


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print( "Useage: {} <data_file.json | cragList.pickle>" )
        sys.exit(1)

    dataPath = sys.argv[1]
    if dataPath.endswith(".pickle"):
        ## load from pickle
        crags = cragsFromPickle(dataPath)

        for crag in crags:
            print( "{name}".format(**crag) )
            for route in crag['route']:
                print( "    {name} ({grade}): {soft} soft, {fair} fair, {hard} hard / {total}\n        Fairness: {fairness}\n".format(**route) ) 

    elif dataPath.endswith(".json"):
        ## load from json
        crags = cragsFromJson(dataPath)

        # pickle it, now that we've got it
        pickleName = 'pickles/{}.pickle'.format(os.path.basename(dataPath).split('.')[0])
        with open(pickleName, 'w') as f:
            print_err("Pickling to {}...".format(pickleName))
            pickler = cPickle.Pickler(f)
            pickler.dump(crags)
        jsonName = 'json/{}.json'.format(os.path.basename(dataPath).split('.')[0])
        with open (jsonName, 'w') as f:
            f.write(json.dumps(crags))
    else:
        print_err( "Unknown filetype for " + dataPath)
        sys.exit(1)



