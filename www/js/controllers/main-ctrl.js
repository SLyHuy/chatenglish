ChatApp.controller('MainCtrl', function($scope, $state, $ionicLoading, appService){
	$scope.title = 'Chat với người lạ by English';
	$scope.titleBtn = 'New Chat';
	$scope.textHeader = 'Start chatting with Stranger';
	$scope.isLogin = window.isLogin = true;
	var fbInited = false;
	
	$scope.newChat = function(){
		if (!fbInited){
			return;
		}
		//$state.transitionTo('chat');

		if (!window.isLogin){
			$ionicLoading.show({
				template: 'Please login!'
			});
			appService.doLogin(function(result){
				if (result){
					window.isLogin = $scope.isLogin = true;
					$scope.titleBtn = 'New Chat';
					$scope.textHeader = 'Start chatting with Stranger';
					window.userData = result;

					$state.transitionTo('chat');
				}
				else{

				}
				$ionicLoading.hide();
			});
		}
		else{
			$state.transitionTo('chat');
		}
		
	};

	var callbackFB = function(){
		//check fb login status
		appService.checkLogin(function(response){
			//$scope.$apply(function(){
				if (response){
					window.isLogin = $scope.isLogin = true;
					$scope.titleBtn = 'New Chat';
					$scope.textHeader = 'Start chatting with Stranger';

					window.userData = response;
				}
				else{
					window.isLogin = $scope.isLogin = false;
					$scope.textHeader = 'Login with Facebook to start chatting with the stranger'
					$scope.titleBtn = 'Login';
				}
				$ionicLoading.hide();
			//});
			
		});
				
	};

	if (typeof window.userData == 'undefined' || typeof window.FB == 'undefined'){
		$ionicLoading.show({
			template: 'Loading facebook connection...'
		});
		fbInited = false;
		$scope.titleBtn = 'Loading...';

		//init callback FB
		window.fbAsyncInit = function() {
			FB.init({
				appId: Config.fbAppId,
				xfbml: true,
				version: 'v2.0'
			});
			fbInited = true;
			callbackFB();
		};

		//Load FB SDK
		(function(d, s, id) {
			var js, fjs = d.getElementsByTagName(s)[0];
			if(d.getElementById(id)) {
				return;
			}
			js = d.createElement(s);
			js.id = id;
			js.src = "//connect.facebook.net/en_US/sdk.js";
			fjs.parentNode.insertBefore(js, fjs);
		}(document, 'script', 'facebook-jssdk'));
	}
	else{
		$ionicLoading.show({
			template: 'Checking...'
		});
		fbInited = true;
		callbackFB();
	}
});