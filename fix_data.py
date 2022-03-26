
with open('.\denmark_tiles\MAP_VIEW.json', 'r') as istr:
    with open('.\denmark_tiles\MAP_VIEW_FIXED.json', 'w') as ostr:
        ostr.write("[")
        for line in istr:
            line = line.rstrip('\n') + ','
            print(line, file=ostr)
        ostr.write("]")