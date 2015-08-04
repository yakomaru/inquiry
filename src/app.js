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

var parseLinks = function(site, dom, siteObj, storage) {
  $('a', dom).each(function() {
    var href = $(this).attr('href');
    if(href[0] === '/') {
      href = site + href;
    }
    if(href.indexOf(site) !== -1) {
      if(!siteObj[href] && !storage[href]) {
        siteObj[href] = href;
      }
    }
  });
};

var parseKeywords = function(site, dom, storage) {
  if(!storage[site]) {
    storage[site] = {value: site, keywords: {}};
  }
  var text = $('body', dom).text();
  text = text.replace(/[\n\r,.?!]/g, ' ');
  text = text.split(' ');
  text.forEach(function(word) {
    word = word.toLowerCase();
    if(!storage[site].keywords[word]) {
      storage[site].keywords[word] = true;
    }
  });
};

angular.module('inquiry', [])
  .controller('search', function($scope) {
    $scope.site = 'http://nathanielparrish.com';
    $scope.startButton = 'Start';
    $scope.compiling = false;
    $scope.storage = {};
    $scope.search = '';

    $scope.compile = function() {
      var siteObj = {};
      var site = $scope.site;
      $scope.compiling = true;
      $scope.startButton = 'Compiling';
      corsAjax(site, function(data) {
        var dom = new DOMParser().parseFromString(data, 'text/html');
        parseLinks(site, dom, siteObj, $scope.storage);
        parseKeywords(site, dom, $scope.storage);
        console.log(siteObj);
        console.log($scope.storage);
      });
    };

    $scope.searchFilter = function(site) {
      var search = $scope.search.split(' ');
      return search.every(function(word) {
        word = word.toLowerCase();
        return !!$scope.storage[site].keywords[word];
      });
    };
  });
