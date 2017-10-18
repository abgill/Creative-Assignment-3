angular.module('myApp', ["ui.router","ngSanitize"])
    .controller('searchCtrl', ['$scope','$http','$stateParams', '$location',searchCtrl])
    .controller('albumCtrl', ['$scope','$http', '$stateParams', albumCtrl])
    .directive('album',albumDir)
    .config(['$stateProvider','$urlRouterProvider',route]);


function albumCtrl ($scope,$http,$stateParams) {
    console.log($stateParams.album);
    $scope.album = $stateParams.album;
    $scope.artist = $stateParams.artist;
    $scope.coverurl = "#";
    $scope.wiki = "";
    $scope.trackList = [];

    $http({
        method : "GET",
        url : "http://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=152d1d85d483fc56d5b7c01e6a1d41bb&artist=" + $stateParams.artist +"&album="+ $stateParams.album +"&format=json"
    }).then(function mySuccess(response) {
        $scope.album = response.data.album.name;
        $scope.coverurl = response.data.album.image[4]['#text'];
        $scope.wiki = response.data.album.wiki.summary;
        $scope.trackList = response.data.album.tracks.track;
        console.log(response);
    });

}

function route ($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('search',{
            url: '/search/{album}',
            templateUrl:'search.html',
            controller: 'searchCtrl'
        })
        .state('home',{
            url: '/search',
            templateUrl:'search.html',
            controller: 'searchCtrl'
        })
        .state('album',{
            url: '/album/{album}/:artist',
            templateUrl: 'albumpage.html',
            controller:'albumCtrl'
        });
    $urlRouterProvider.otherwise('/search');
}

function searchCtrl ($scope, $http, $stateParams, $location) {
    $scope.albumSearch = "";
    $scope.imgPath = '';
    $scope.albums = [];
    $scope.showInstructionDiv = false;

    $scope.albumFactory = function (albumUrl, albumName, albumArtist) {
        return {
            artworkUrl: albumUrl,
            name : albumName,
            artist : albumArtist
        };
    }

    $scope.submitSearch = function () {
        $location.url('/search/' + $scope.albumSearch);
    }

    $scope.search = function (){
        $http({
            method : "GET",
            url : "http://ws.audioscrobbler.com/2.0/?method=album.search&album="+ $scope.albumSearch +"&api_key=152d1d85d483fc56d5b7c01e6a1d41bb&format=json"
        }).then(function mySuccess(response) {
            var albumData = angular.copy(response.data.results.albummatches.album);
            //console.log(albumData);
            $scope.imgPath = response.data.results.albummatches.album[0].image[2]['#text'];
            $scope.albums = [];
            for(var i = 0; i < albumData.length; i++ ){
                $scope.albums.push(($scope.albumFactory(albumData[i].image[2]['#text'],
                    albumData[i].name,
                    albumData[i].artist)));
            }

            console.log($scope.albums);

        }, function myError(response) {
            $scope.albumText = response.statusText;
        });
    };

    $scope.selectAlbum = function (albumdat) {
        $location.url('/album/' + albumdat.name + '/' + albumdat.artist);
    };

    if($stateParams.album && $stateParams.album.length > 0){
        $scope.albumSearch = $stateParams.album;
        $scope.search();
        $scope.showInstructionDiv = true;
    }

}

function albumDir() {
    return {
        scope: { albumdat: '='},
        restrict: 'E',
        replace: 'true',
        template: (
            '<div>'
            + '<h4>Artist: {{albumdat.artist}}</h4>'
            + '<h4>Album Name: {{albumdat.name}}</h4>'
            + '<img height="100" width="100" src="{{albumdat.artworkUrl}}" />' +
            '<hr>'+
            '</div>'
        ),
        link : function link(scope, element, attrs){
            if(!scope.albumdat.artworkUrl){
                scope.albumdat.artworkUrl = "musicnote.jpg";
            }
        }
    };
}