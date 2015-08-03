angular.module('inquiry', [])
  .controller('search', function($scope) {
    $scope.site = '';
    $scope.startButton = 'Start';
    $scope.compiling = false;
    $scope.storage = {'nathanielparrish.com': {value: 'nathanielparrish.com', nate: 1}};
    $scope.search = '';

    $scope.compile = function() {
      $scope.compiling = true;
      $scope.startButton = 'Compiling';
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