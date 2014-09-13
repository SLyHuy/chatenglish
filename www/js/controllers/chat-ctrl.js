ChatApp.controller('ChatCtrl', function($scope, $state, $timeout, $interval, $ionicScrollDelegate, chatService){
	$scope.title = 'Chat với người lạ by English';
	$scope.chats = [];
	// $scope.typingText = 'typing...';

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

	var isTyping = false;
	var timer;
	var lastTimeKeyPress = 0;
	var typingEle;

	function receiveChat(data){
		var content;

		if ($scope.chats.length > 0){
			if ($scope.chats[$scope.chats.length - 1].type == 'typing'){
				$scope.chats.pop();
			}
		}

		if (data.type == 'chat'){
			content = {
				type: data.from == 'system' ? 'system' : 'stranger',
				content : data.message
			};

			if (timer){
				isTyping = false;
				$interval.cancel(timer);
			}

		}
		else if (data.type == 'action'){
			if (data.action == 'typing'){
				content = {
					type: 'typing'
				};
			}
			else{
				
			}
		}

		//Check Like function
		if (data.type == 'chat' && data.from == 'system' && data.stranger){
			$scope.showLike = true;

			if(data.stranger.isLiked){
				$scope.strangerLiked = true;
			}
		}

		if (content){
			$scope.chats.push(content);
		}
		
		$scope.$apply(function(){			
			$ionicScrollDelegate.scrollBottom(true);
		});
	}

	

	$scope.sendChat = function(){
		var that = this;
		that.newChat = that.newChat.trim().replace(/\s{2,}/g, ' ');
		var newChat = that.newChat;
		if (newChat && newChat !== ''){
			if (timer){
				isTyping = false;
				$interval.cancel(timer);
			}


			chatService.sendMessage({
				type: 'chat',
				message: newChat
			});

			var content = {
				type: 'me',
				content : newChat
			};

			if ($scope.chats.length > 0 && $scope.chats[$scope.chats.length - 1].type == 'typing'){
				$scope.chats.splice($scope.chats.length - 1, 0, content);
			}
			else{
				$scope.chats.push(content);
			}
			
			$ionicScrollDelegate.scrollBottom(true);

		}

		that.newChat = '';
		$scope.focusInput = true;
	};

	$scope.chatKeyPress = function(e){
		lastTimeKeyPress = e.timeStamp;
		if (isTyping == false){
			isTyping = true;
			chatService.sendMessage({
				type: 'action',
				action: 'typing'
			});
			$interval.cancel(timer);
			timer = $interval(function(){
				if (isTyping && (new Date()).getTime() - lastTimeKeyPress > 4000){
					isTyping = false;
					$interval.cancel(timer);
					chatService.sendMessage({
						type: 'action',
						action: 'stop type'
					});
				}
			}, 1000);
		}
		else{

		}
	}

	$scope.likeStranger = function(){
		if ($scope.strangerLiked){
			return false;
		}
		$scope.strangerLiked = true;

		chatService.sendMessage({
			type: 'action',
			action: 'like'
		});

		var content = {
			type: 'system',
			content : 'You\'ve just like the stranger. Thank you.'
		};

		$scope.chats.push(content);
		$ionicScrollDelegate.scrollBottom(true);
	};

	// var countText = 0;
	// $interval(function(){
	// 	countText = (countText + 1) % 4;
	// 	$scope.typingText = 'typing' + '...'.substr(3 - countText);
	// 	// $scope.$apply(function(){
	// 	// 	$scope.typingText = 'typing' + '...'.substr(3 - countText);
	// 	// });

	// }, 500);

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