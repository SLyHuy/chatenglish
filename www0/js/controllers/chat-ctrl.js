ChatApp.controller('ChatCtrl', function($scope, $state, $timeout, $ionicScrollDelegate, chatService){
	$scope.title = 'Chat với người lạ by English';
	$scope.chats = [];

	console.log(userData);

	//Developer...
	//var data = [];

	// var data = [{
	// 	type: 'system',
	// 	content : 'Waiting a stranger...'
	// },{
	// 	type: 'system',
	// 	content : 'The stranger has joined the room. Let\'s say "Hi".'
	// }];

	function initChat(){
		// $scope.chats = data;
		// $timeout(function(){
		// 	$ionicScrollDelegate.scrollBottom();
		// }, 0, true);

		
		chatService.init({
			callbackSendMessage: function(){},
			callbackReceiveMessage: receiveChat,
			callbackConnect: function(){},
			callbackClose: onClose
		});
	};

	function onClose(){
		$scope.$apply(function(){	
			$scope.chats.push({
				type: 'system',
				content: 'You has been disconnected, please exit and make new chat.'
			});
			$ionicScrollDelegate.scrollBottom(true);
		});
	}

	function receiveChat(data){
		var content = {
			type: data.from == 'system' ? 'system' : 'stranger',
			content : data.mess
		};
		$scope.$apply(function(){	
			$scope.chats.push(content);
			$ionicScrollDelegate.scrollBottom(true);
		});
	}


	$scope.sendChat = function(){
		var that = this;
		that.newChat = that.newChat.trim().replace(/\s{2,}/g, ' ');
		var newChat = that.newChat;
		if (newChat && newChat !== ''){
			var date = new Date();
			chatService.sendMessage(newChat);

			var content = {
				type: 'me',
				content : newChat
			};
			
			$scope.chats.push(content);
			
			$ionicScrollDelegate.scrollBottom(true);

		}

		that.newChat = '';
		$scope.focusInput = true;
	};


	// data = data.concat([{
	// 	type: 'me',
	// 	content : 'You at the airport yet aaa?'
	// },{
	// 	type: 'me',
	// 	content : 'I\'m in trafic. Wondering if we have to go through is customs in Toronto or San Francisco.'
	// },{
	// 	type: 'stranger',
	// 	content : 'Customs in toronto'
	// },{
	// 	type: 'me',
	// 	content : 'Sweet. Thx brah'
	// },{
	// 	type: 'time',
	// 	date: 'Thu, Sep 19',
	// 	time: '1:26 PM'
	// },{
	// 	type: 'me',
	// 	content : 'Sub b.'
	// },{
	// 	type: 'time',
	// 	date: 'Sun, Sep 22',
	// 	time: '4:18 PM'
	// },{
	// 	type: 'stranger',
	// 	content : 'Just chillin\'s and hanging out bro. What\'s your plans tomm? Are we still doing that thing we discussed about?'
	// }]);

	initChat();
});


ChatApp.controller('navBarCtrl', function($scope, $state, $ionicNavBarDelegate, chatService){
	$scope.exit = function(){
		console.log('User exit!!');
		chatService.exit();

		$ionicNavBarDelegate.back();
	}
});