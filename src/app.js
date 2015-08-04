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
  })
    .fail(function() {
      cb('');
    });
};

var parseLinks = function(site, dom, siteObj, storage) {
  $('a', dom).each(function() {
    var href = $(this).attr('href');
    if(href && href[0] === '/') {
      href = site + href;
    }
    if(href && href.indexOf(site) !== -1) {
      if(!siteObj[href] && !storage[href]) {
        siteObj[href] = href;
      }
    }
  });
};

var parseKeywords = function(site, dom, storage) {
  if(site.slice(0, 4) === 'http') {
    if(site[site.length - 1] === '/') {
      site = site.slice(0, site.length - 1);
    }
    if(!storage[site]) {
      storage[site] = {value: site, title: $('title', dom).text(), keywords: {}};
      var text = $('body', dom).text();
      text = text.replace(/[\n\r,.?!]/g, ' ');
      text = text.split(' ');

      text.forEach(function(word) {
        word = word.toLowerCase();
        if(!storage[site].keywords[word]) {
          storage[site].keywords[word] = true;
        }
      });
    }
  }
};

var recurse = function(siteArray, storage, cb) {
  if(siteArray.length > 0) {
    var page = siteArray.pop();

    corsAjax(page, function(data) {
      var dom = new DOMParser().parseFromString(data, 'text/html');
      parseKeywords(page, dom, storage);
      recurse(siteArray, storage, cb);
    });

  } else {
    cb();
  }
};

angular.module('inquiry', [])
  .controller('search', function($scope) {
    $scope.site = 'http://nathanielparrish.com';
    $scope.compiling = false;
    $scope.storage = {};
    $scope.search = '';

    $scope.compile = function() {
      $scope.storage = {};
      var siteObj = {};
      var site = $scope.site;
      $scope.compiling = true;
      $scope.startButton = 'Compiling';

      corsAjax(site, function(data) {
        var dom = new DOMParser().parseFromString(data, 'text/html');
        parseLinks(site, dom, siteObj, $scope.storage);
        parseKeywords(site, dom, $scope.storage);
        var siteArray = [];
        for(var page in siteObj) {
          siteArray.push(page);
        }
        
        recurse(siteArray, $scope.storage, function() {
          $scope.compiling = false;
          $scope.$apply();
        });
      });
    };

    $scope.buttonText= function() {
      if($scope.compiling) {
        return 'Compiling';
      } else {
        return 'Start';
      }
    };

    $scope.searchFilter = function(site) {
      var search = $scope.search.split(' ');

      return search.every(function(word) {
        word = word.toLowerCase();
        return !!$scope.storage[site].keywords[word];
      });
    };
  });
