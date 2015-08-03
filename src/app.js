angular.module('inquiry', [])
  .controller('search', function($scope) {
    $scope.site = '';
    $scope.storage = {'nathanielparrish.com': {value: 'nathanielparrish.com', nate: 1}};
    $scope.search = '';

    $scope.compile = function() {

    };

    $scope.searchFilter = function(site) {
      if($scope.search === '') {
        return true;
      }
      var search = $scope.search.split(' ');
      return search.every(function(word) {
        return !!$scope.storage[site][word];
      });
    };
  });