var corsAjax = function(site, cb) {
  $.ajaxPrefilter( function (options) {
    if (options.crossDomain && jQuery.support.cors) {
      var http = (window.location.protocol === 'http:' ? 'http:' : 'https:');
      options.url = http + '//cors-anywhere.herokuapp.com/' + options.url;
      //options.url = "http://cors.corsproxy.io/url=" + options.url;
    }
  });

  $.get(site, function (response) {
    // console.log(response);
    // $("#viewer").html(response);
    cb(response);
  });
};

var parse = function(site, data, siteObj, storage) {
  var dom = new DOMParser().parseFromString(data, 'text/html');
  $('a', dom).each(function() {
    var href = $(this).attr('href');
    if(href[0] === '/') {
      href = site + href;
    }
    if(site.indexOf(href) !== -1) {
      if(!siteObj[href]) {
        siteObj[href] = href;
      }
    }
  });
  // continue parsing for keywords
};

angular.module('inquiry', [])
  .controller('search', function($scope) {
    $scope.site = 'http://nathanielparrish.com';
    $scope.startButton = 'Start';
    $scope.compiling = false;
    $scope.storage = {'nathanielparrish.com': {value: 'nathanielparrish.com', keywords: {}}};
    $scope.search = '';

    $scope.compile = function() {
      var siteObj = {};
      var site = $scope.site;
      $scope.compiling = true;
      $scope.startButton = 'Compiling';
      corsAjax(site, function(data) {
        parse(site, data, siteObj);
      });
    };

    $scope.searchFilter = function(site) {
      if($scope.search === '') {
        return true;
      }
      var search = $scope.search.split(' ');
      return search.every(function(word) {
        return !!$scope.storage[site].keywords[word];
      });
    };
  });
