(function() {
    'use strict';
    // jscs:disable requireCamelCaseOrUpperCaseIdentifiers

    angular
        .module('blocks.auth')
        .factory('AuthInterceptor', AuthInterceptor)
        .config(config);

    AuthInterceptor.$inject = ['$q', '$location', '$injector', 'config'];

    function AuthInterceptor($q, $location, $injector, c) {
        var oauth_timestamp = Math.floor(new Date().getTime() / 1000);
        var service = {
            request: request,
            responseError: responseError
        };

        return service;
        //////////////

        function request(config) {
            config.headers = config.headers || {};
            var common = $injector.get('common');
            var AuthToken = $injector.get('AuthToken');
            var authData = AuthToken.getToken();
            var nonce = common.randomString(10);
            var url = config.url,
                httpMethod = config.method,
                parameters = {
                    oauth_consumer_key: c.consumerKey,
                    oauth_nonce: nonce,
                    oauth_signature_method: 'HMAC-SHA1',
                    oauth_timestamp: oauth_timestamp,
                    oauth_token: authData.oauth_token
                },
                consumerSecret = c.consumerSecret,
                signature = oauthSignature.generate(httpMethod, url, parameters, consumerSecret, null, {
                    encodeSignature: false
                });

            if (authData.oauth_token) {
                config.headers.Authorization = 'OAuth oauth_consumer_key=' + c.consumerKey + ' oauth_nonce =' +
                    nonce + ' oauth_signature=' + signature + ' oauth_signature_method=' +
                    parameters.oauth_signature_method + ' oauth_timestamp=' + oauth_timestamp +
                    ' oauth_token=' + authData.oauth_token;
            }
            return config;
        }

        function responseError(rejection) {
            return $q.reject(rejection);
        }
    }

    function config($httpProvider) {
        $httpProvider.interceptors.push('AuthInterceptor');
    }
})();
