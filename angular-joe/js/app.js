var jitteryApp = angular.module('jitteryApp', []);

jitteryApp.controller('ReviewListCtrl', function ($scope, $http) {
  // Set our reviews object to be empty by default.
  $scope.reviews = [];

  // *******************************************************
  // ************* There's new stuff here ******************
  // *******************************************************
  // Let the blends object be accessible by any function in the controller
  var blends;
  // *******************************************************
  // ************ End of new stuff section *****************
  // *******************************************************
  
  // JSON API Call:
  // JSONP to get the current ratings.
  $http.jsonp('http://jitteryjoes.myplanetfellowship.com/api/ratings.jsonp?callback=JSON_CALLBACK').
    success(function(data, status) {
      $scope.reviews = data;
// *******************************************************
// ************* There's new stuff here ******************
// *******************************************************
      // The creation of the Blends object happens after successfully reading
      // both the JJ's reviews and the local JSON file
      $http.get('js/blends.json').then(function(res){
        // Read blend descriptions and tags from blends.json
        var desc = res.data;

        // Creating a Blends object
        blends = new Blends(data, desc);

        // Searching Example: 
        // Bourque Newswatch is the only thing that satisfies these listings
        // Remember to reset the listings once the search is complete
        blends.filterRegions(["Blue Mountain"]);
        blends.filterTags(["#light"]);
        $scope.searchQuery = blends.getListings();
        blends.reset();

        // Safety Example:
        // This next line of code tries to modify the name of the blend to "butts".
        // But instead, it only changes a copy of the record, not the actual one.
        blends.getBlend("Lionel Roastie").name = "butts";
        // The blend will be the same
        $scope.exampleBlends = new Array();
        $scope.exampleBlends.push(blends.getBlend("Lionel Roastie"));
        $scope.exampleBlends.push(blends.getBlend("Connoisseur Estates"));

        // Sorting Example:
        // Similarly, these two sorting options return a copy.
        $scope.popularBlends = blends.sortRating();
        $scope.lexicalBlends = blends.sortAlpha();

      });
// *******************************************************
// *********** Yeah, it's right up there *****************
// *******************************************************
    });

  // Add a new rating to the list.
  $scope.addNewRating = function () {
    // Get the form data from the scope.
    var review = $scope.review;

    // Prepare the data.
    var nodeData = {
      'type': 'review',
      'field_review_comment': {'und': [{'value': review.comment} ]},
      'field_review_rating': {'und': [{'value': review.rating} ]},
      'field_review_item': {'und': {'value': review.item}},
      'field_origin_app': {'und': [{'value': 'U AND I'}]}
    };

    // POST the data and create a node.
    $http({url: 'http://jitteryjoes.myplanetfellowship.com/api/node.json', method: 'POST', data: nodeData}).
      success(function(data, status) {
        // Setup data object.
        var review = $scope.review;
        // Add our app id and date in seconds.
        review.app = 'U AND I';
        var d = new Date();
        review.node_created = (d.getTime() / 1000);

        // Add the review to the reviews array.
        $scope.reviews.unshift (review);

        // Reset form vars.
        $scope.review = {};
      });
  }

  // Set our "signupSent" flag to false by default.
  $scope.signupSent = false;

  // Add a newsletter signup.
  $scope.addNewSignup = function () {
    // Get the form data from the scope.
    var user = $scope.user;

    // Prepare the data.
    var nodeData = {
      'type': 'signup',
      'field_user_name': {'und': [{'value': user.name} ]},
      'field_user_email': {'und': [{'value': user.email} ]},
      'field_origin_app': {'und': [{'value': 'U AND I'}]}
    };
  }
});
