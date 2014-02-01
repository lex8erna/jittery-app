/* How to use:
  
  This module contains the Blends class, which implements a number of useful functions.
  To create a new Blends object, use:
    var example = Blends(data, desc);
  Where data is the object returned by the http.jsonp call (Blends can only be created there.)
  and desc is the JSON object obtained from the description file

  After creating the Blends object, the following methods are available:
    example.sortAlpha();
      - Sorts the listings alphabetically
      - Returns a copy of the sorted array
    example.sortRating();
      - Sorts the listings by average rating
      - Returns a copy of the sorted array
    example.filterRegions();
      - Filters the listings by regions (in an array)
      - Returns a copy of the filtered array
    example.filterTags();
      - Filters the listings by tags (in an array)
      - Returns a copy of the filtered array
    example.getBlend("Blend Name Here");
      - Returns a blend object
    example.reset();
      - Resets listings to original state
  
  Blend objects have the following fields:
    @name:          Name of the blend
    @number:        Number of times the blend has been rated
    @totalRatings:  Total rating points (or just "points")
    @average:       Average rating 
    @description:   Description of the blend
    @regions:       Regions of the blend
    @tags:          Tags of the blend

  The last three fields are retrieved from the blends.json file.
*/

function Blends(data, desc){
  // Records and listings are private
  var records = buildBlends(data, desc);
  var listings = buildOrder(records);

  // These methods are publicly accessible
  this.sortAlpha = alphaSort;
  this.sortRating = popularitySort;
  this.getBlend = getBlend;
  this.getListings = getListings;
  this.filterRegions = filterRegions;
  this.filterTags = filterTags;
  this.reset = reset;

  /**
   * clone: the fastest cloner
   *  This function creates a (shallow) clone of an object. For safety reasons.
   */
  function clone(obj) {
    var copy = {};
    for (var field in obj) {
      if (obj.hasOwnProperty(field)) {
        copy[field] = obj[field];
      }
    }
    return copy;
  }

  /**
   * compareField: the comparator factory
   *  This function creates a comparator function for sorting by a field, under a closure.
   *  (The built-in array sort function requires that the comparator returns -1, 0, or 1)
   */
  function compareField(field){
    return function (a, b){
      if (a[field] < b[field]) return -1;
      if (a[field] > b[field]) return 1;
      return 0;
    }
  }

  /**
   * buildBlends: the record builder
   *  It creates a record object from the given dataset
   */
  function buildBlends(data, desc){
    var blendRecords = {};

    for (var i = 0; i < data.length; i++) {
      var blend = data[i];
      var name = data[i].item;
      var rating = data[i].rating;

      // Question: Do we already have this blend in blendRecords?

      // If yes, update the record
      if (blendRecords[name]){
        blendRecords[name]["number"]++;
        blendRecords[name]["totalRatings"] += parseInt(rating);
        // Recalculate average and include up to 1 decimal place, if required
        var avg = blendRecords[name]["totalRatings"] / blendRecords[name]["number"];
        blendRecords[name]["average"] = +avg.toFixed(1);
      }
      // If not, start a new one
      else{
        blendRecords[name] = {};
        blendRecords[name]["name"] = name;
        blendRecords[name]["number"] = 1;
        blendRecords[name]["totalRatings"] = parseInt(rating);
        blendRecords[name]["average"] = parseInt(rating);
        blendRecords[name]["description"] = desc[name]["description"];
        blendRecords[name]["regions"] = desc[name]["regions"];
        blendRecords[name]["tags"] = desc[name]["tags"];
      }
    }

    return blendRecords;
  }

  /**
   * buildOrder: the orderer
   *  It makes an ennumerated array version of the records.
   */
  function buildOrder(data){
    var blendListing = [];
    for (var items in data){
      blendListing.push(data[items]);
    }
    return blendListing;
  }

  /**
   * reset: the resetter
   *  It resets the records, for use after filtering.
   */
  function reset(){
    listings = buildOrder(records);
  }

  /**
   * getBlend: the fetcher
   *  It's a safer way to retrieve a blend record.
   */
  function getBlend(blend){
    // This is actually a clone of a clone's copy.
    return clone(clone(records)[blend]);
  }

  /**
   * getListings: the other fetcher
   *  It's a safer way to retrieve the listings record.
   */
  function getListings(){
    return listings.slice(0);
  }

  /**
   * popularitySort: the popularity sorter
   *  It sorts by popularity. 'nuff said.
   */
  function popularitySort(){
    // Sort array and reverse it
    listings.sort(compareField("average"));
    listings.reverse();

    // We're done
    return listings.slice(0);
  }

  /**
   * alphaSort: the lexical sorter
   *  It sorts by alphabetical order. 'nuff said.
   */
  function alphaSort(){
    // Sort array and reverse it
    listings.sort(compareField("name"));

    // We're done
    return listings.slice(0);
  }

  /**
   * intersect: the intersector
   *  It counts the number of common elements of array a and b.
   */
  function intersect(a, b)
  {
    var aIndex=0, bIndex=0;
    var intersections = 0;

    while(aIndex < a.length && bIndex < b.length)
    {
      if (a[aIndex] < b[bIndex])
        aIndex++;
      else if (a[aIndex] > b[bIndex])
        bIndex++;
      else {
        intersections++;
        aIndex++;
        bIndex++;
      }
    }

    return intersections;
  }

  /**
   * filterRegions: the regional filter
   *  It sorts by region. 'nuff said.
   */
  function filterRegions(regions){
    // Destructive method
    var numOfBlends = listings.length;
    var filteredListings = new Array();
    for (var i = 0; i < numOfBlends; i++){
      if (intersect(listings[i].regions, regions) == regions.length){
        filteredListings.push(listings[i]);
      }
    }
    delete listings;
    listings = filteredListings;
    
    // We're done
    return filteredListings.slice(0);
  }

  /**
   * filterRegions: the regional filter
   *  It sorts by region. 'nuff said.
   */
  function filterTags(tags){
    // Destructive method
    var numOfBlends = listings.length;
    var filteredListings = new Array();
    for (var i = 0; i < numOfBlends; i++){
      if (intersect(listings[i].tags, tags) == tags.length){
        filteredListings.push(listings[i]);
      }
    }
    delete listings;
    listings = filteredListings;

    // We're done
    return filteredListings.slice(0);
  }
}