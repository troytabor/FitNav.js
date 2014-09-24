(function (document, window, index) {
	
	var responsiveNav = function (el, options) {
		
		var addClass = function (el, cls) {
			if (el.className.indexOf(cls) !== 0) {
				el.className += " " + cls;
				el.className = el.className.replace(/(^\s*)|(\s*$)/g,"");
			}
		},
		
		removeClass = function (el, cls) {
			var reg = new RegExp("(\\s|^)" + cls + "(\\s|$)");
			el.className = el.className.replace(reg, " ").replace(/(^\s*)|(\s*$)/g,"");
		};
		
		var nav;

		var ResponsiveNav = function (el, options) {
		
			var i;
	
			// Default options
			this.options = {  // Function: Close callback
			};
	
			// User defined options
			for (i in options) {
			  this.options[i] = options[i];
			}
			
			// Wrapper
			this.wrapperEl = el.replace("#", "");
			
			// Try selecting ID first
			if (document.getElementById(this.wrapperEl)) {
				this.wrapper = document.getElementById(this.wrapperEl);
			
			// If element with an ID doesn't exist, use querySelector
			} else if (document.querySelector(this.wrapperEl)) {
				this.wrapper = document.querySelector(this.wrapperEl);
			
			// If element doesn't exists, stop here.
			} else {
				throw new Error("The nav element you are trying to select doesn't exist");
			}
			
			nav = this.wrapper;
			
			// Init
			this._init(this);
		};
		
		ResponsiveNav.prototype = {
			
			// Public methods
			destroy: function () {},
			
			collapse: function () {
				addClass( nav, 'collapsed' );
			},
			
			expand: function () {
				removeClass( nav, 'collapsed' );
			},
			
			open: function () {
				nav.querySelector( 'ul' ).style.height = this._calcHeight() + 'px';	
				
			},
			
			close: function () {
				nav.querySelector( 'ul' ).removeAttribute( 'style' );
			},
			
			// Private methods
			_init: function () {
				
				var self = this;
				
				self._isWrapped() ?
					self.collapse() :
					self._resetHeight();
					
				
				window.onresize = function () {
					self.expand();
					self._isWrapped() ?
						self.collapse() :
						self._resetHeight();
				};
				
				nav.querySelector( '.responsivenav__toggle' ).onclick = function () { self.open() };
			},
			
			_addToggle: function () {
				
			},
			
			_calcWidth: function () {
				
				var children = nav.querySelectorAll( 'li' ),
					width = 0;
				
				for (var i = 0; i < children.length; i++) {
					width += parseInt( children[i].offsetWidth, 10 );
				}
				
				return width;
			},
			
			_resetHeight: function () {
				
				
				//nav.querySelector( 'ul' ).removeAttribute( 'style' );
			},
			
			_calcHeight: function () {
				
				var children = nav.querySelectorAll( 'li' ),
					height = 0;
				
				for (var i = 0; i < children.length; i++) {
					height += children[i].offsetHeight;
				}
				
				//nav.querySelector( 'ul' ).style.height = height + 'px';
				
				return height;
			},
			
			_isWrapped: function () {
				
				var isWrapped = this._calcWidth() >= nav.parentNode.offsetWidth ? true : false;
				
				//alert( this._calcWidth() );
				/*
				var wrapperHeight = nav.offsetHeight,
					liHeight = nav.querySelector( 'li' ).offsetHeight
					isWrapped = wrapperHeight >= liHeight*2 ? true : false;
				*/
				
				return isWrapped;
					
			}
			
		};
			
		return new ResponsiveNav(el, options);
	
	};
		  
		
	window.responsiveNav = responsiveNav;
		

}(document, window, 0));