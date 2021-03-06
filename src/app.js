var corsAjax = function(site, cb) {
  $.ajax({
    method: 'POST',
    url: '/',
    data: {site: site}
  })
  .done(function (res) {
    console.log('page get:\n', site);
    cb(res);
  })
  .fail(function () {
    console.log('failed to get:\n' + site);
    cb('');
  });
};

var parseLinks = function(site, dom, siteObj, storage) {
  var domain = 'http://' + site.split('/')[2];
  $('a', dom).each(function() {
    var href = $(this).attr('href');
    if(href && href[0] === '/') {
      href = domain + href;
    }
    if(href && href.indexOf(domain) !== -1) {
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

var recurse = function(siteArray, storage, cb, applycb) {
  if(siteArray.length > 0) {
    var page = siteArray.pop();
    if(storage[page]) {
      recurse(siteArray, storage, cb, applycb);
      return;
    }
    corsAjax(page, function(data) {
      var dom = new DOMParser().parseFromString(data, 'text/html');
      parseKeywords(page, dom, storage);
      applycb();
      recurse(siteArray, storage, cb, applycb);
    });

  } else {
    cb();
  }
};

angular.module('inquiry', ['ngAnimate'])
  .controller('search', function($scope) {
    $scope.site = '';
    $scope.compiling = false;
    $scope.storage = {};
    $scope.search = '';

    $scope.compile = function() {
      console.clear();
      $scope.storage = {};
      var siteObj = {};
      var site = $scope.site;
      if(site[site.length - 1] === '/') {
        site = site.slice(0, site.length - 1);
      }
      $scope.compiling = true;
      $scope.startButton = 'Compiling';

      corsAjax(site, function(data) {
        var dom = new DOMParser().parseFromString(data, 'text/html');
        parseLinks(site, dom, siteObj, $scope.storage);
        parseKeywords(site, dom, $scope.storage);
        $scope.$apply();
        var siteArray = [];
        for(var page in siteObj) {
          siteArray.push(page);
        }

        recurse(siteArray, $scope.storage, function() {
          $scope.compiling = false;
          $scope.$apply();
        }, function() {
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
      var str = '';
      for(var keyword in $scope.storage[site].keywords) {
        str += ' ' + keyword;
      }

      return search.every(function(word) {
        word = word.toLowerCase();
        return str.indexOf(word) !== -1;
      });
    };
  });
