/*! FitNav.js 1.0
 * https://github.com/stephansmith/FitNav.js
 *
 * Copyright (c) 2014 @_stpehansmith
 * Available under the MIT license
 */
 
 (function (document, window, index) {
	
	var fitNav = function ( el, options ) {
		
		var computed = !!window.getComputedStyle;
		
		// getComputedStyle polyfill
		if ( !computed ) {
			window.getComputedStyle = function(el) {
				this.el = el;
				this.getPropertyValue = function(prop) {
					var re = /(\-([a-z]){1})/g;
					if (prop === 'float') {
						prop = 'styleFloat';
					}
					if (re.test(prop)) {
						prop = prop.replace(re, function () {
							return arguments[2].toUpperCase();
						});
					}
					return el.currentStyle[prop] ? el.currentStyle[prop] : null;
				};
				return this;
			};
		}
		
		var addEvent = function (el, evt, fn, bubble) {
			if ('addEventListener' in el) {
				// BBOS6 doesn't support handleEvent, catch and polyfill
				try {
					el.addEventListener(evt, fn, bubble);
				} catch (e) {
					if (typeof fn === 'object' && fn.handleEvent) {
						el.addEventListener(evt, function (e) {
							// Bind fn as this and set first arg as event object
							fn.handleEvent.call(fn, e);
						}, bubble);
					} else {
						throw e;
					}
				}
			} else if ('attachEvent' in el) {
				// check if the callback is an object and contains handleEvent
				if (typeof fn === 'object' && fn.handleEvent) {
					el.attachEvent('on' + evt, function () {
						// Bind fn as this
						fn.handleEvent.call(fn);
					});
				} else {
					el.attachEvent('on' + evt, fn);
				}
			}
		},
		
		removeEvent = function (el, evt, fn, bubble) {
			if ('removeEventListener' in el) {
				try {
					el.removeEventListener(evt, fn, bubble);
				} catch (e) {
					if (typeof fn === 'object' && fn.handleEvent) {
						el.removeEventListener(evt, function (e) {
							fn.handleEvent.call(fn, e);
						}, bubble);
					} else {
						throw e;
					}
				}
			} else if ('detachEvent' in el) {
				if (typeof fn === 'object' && fn.handleEvent) {
					el.detachEvent('on' + evt, function () {
						fn.handleEvent.call(fn);
					});
				} else {
					el.detachEvent('on' + evt, fn);
				}
			}
		},
		
		addClass = function (el, cls) {
			if (el.className.indexOf(cls) !== 0) {
				el.className += ' ' + cls;
				el.className = el.className.replace(/(^\s*)|(\s*$)/g,'');
			}
		},
		
		removeClass = function (el, cls) {
			var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
			el.className = el.className.replace(reg, ' ').replace(/(^\s*)|(\s*$)/g,'');
		},
		
		// forEach method that passes back the stuff we need
		forEach = function (array, callback, scope) {
			for ( var i = 0; i < array.length; i++ ) {
				callback.call( scope, i, array[i] );
			}
		};
		
		var nav,
			navList,
			navToggle,
			isCollapsed;

		var FitNav = function ( el, options ) {
		
			var i;
	
			// Default options
			this.options = {	 // Function: Close callback
				navToggleSelector: '.fitnav__toggle',
				navListSelector: '.fitnav__list',
				navCollapsedClass: 'collapsed'
			};
	
			// User defined options
			for (i in options) {
				 this.options[i] = options[i];
			}
			
			// Wrapper
			this.wrapperEl = el.replace( '#', '' );
			
			// Try selecting ID first
			if (document.getElementById( this.wrapperEl )) {
				this.wrapper = document.getElementById( this.wrapperEl );
			
			// If element with an ID doesn't exist, use querySelector
			} else if ( document.querySelector( this.wrapperEl ) ) {
				this.wrapper = document.querySelector( this.wrapperEl );
			
			// If element doesn't exists, stop here.
			} else {
				throw new Error( 'The element you are trying to select does not exist' );
			}
			
			nav = this.wrapper;
			navList = nav.querySelector( this.options.navListSelector );
			navToggle = nav.querySelector( this.options.navToggleSelector );
			
			// Init
			this._init(this);
		};
		
		FitNav.prototype = {
			
			// Public methods
			destroy: function () {
				removeEvent( window, 'resize', this, false );
				
				removeEvent( navToggle, 'click', this, false );
				
				if ( 'querySelectorAll' in document ) {
					var links = navList.querySelectorAll('a'),
						self = this;
					
					forEach(links, function (i, el) {
						removeEvent(links[i], 'click', function (e) {
							e.preventDefault();
							e.stopPropagation();
							if (isCollapsed) {
								self.toggle();
								setTimeout( function () {
									window.location = links[i].href;
								}, 400);
							}
						}, false);
					});
				}
			},
			
			collapse: function () {
				addClass( nav, this.options.navCollapsedClass );
				isCollapsed = true;
			},
			
			expand: function () {
				removeClass( nav, this.options.navCollapsedClass );
				isCollapsed = false;
				//navList.style.height = 'auto';
			},
			
			open: function () {
				navList.style.height = this._calcHeight() + 'px';	
				
			},
			
			close: function () {
				navList.removeAttribute( 'style' );
			},
			
			toggle: function () {
				if ( navList.offsetHeight > 0 ) {
					this.close();
				}
				else {
					this.open();
				}
			},
			
			resize: function (e) {
				this.expand();
				this._isWrapped() ?
					this.collapse() :
					this._resetHeight();
			},
			
			handleEvent: function (e) {
				var evt = e || window.event;
				
				switch (evt.type) {
					case 'click':
						this._preventDefault(evt);
						if ( evt.target == navToggle ) {
							this.toggle();
						}
						break;
					case 'keyup':
						this._onKeyUp(evt);
						break;
					case 'resize':
						this.resize(evt);
						break;
				}
			},
			
			// Private methods
			_init: function () {
				
				var self = this;
				
				self._isWrapped() ?
					self.collapse() :
					self._resetHeight();
				
				this._closeOnNavClick();
					
				addEvent( window, 'resize', this, false );
				
				addEvent( navToggle, 'click', this, false );
				
			},
			
			_addToggle: function () {
				
			},
			
			_calcWidth: function () {
				
				var children = nav.querySelectorAll( 'li' ),
					width = 0;
				
				for ( var i = 0; i < children.length; i++ ) {
					width += children[i].offsetWidth;
					
					if ( i > 0 ) {
						width += children[i].getBoundingClientRect().left - ( children[i-1].getBoundingClientRect().left + children[i-1].offsetWidth );
					}
					
				}
				
				return width;
			},
			
			_calcParentWidth: function () {
				var clientWidth = nav.parentNode.clientWidth,
					computedStyle = window.getComputedStyle( nav.parentNode ),
					paddingLeft = parseInt( computedStyle.getPropertyValue( 'padding-left' ), 10 ),
					paddingRight = parseInt( computedStyle.getPropertyValue( 'padding-right' ), 10 ),
					width = clientWidth - paddingLeft - paddingRight;
				
				return width;
					
			},
			
			_resetHeight: function () {
				
				navList.removeAttribute( 'style' );
			},
			
			_calcHeight: function () {
				
				var children = nav.querySelectorAll( 'li' ),
					height = 0;
				
				for ( var i = 0; i < children.length; i++ ) {
					height += children[i].offsetHeight;
				}
				
				return height;
			},
			
			_isWrapped: function () {
				
				var isWrapped = this._calcWidth() >= this._calcParentWidth() ? true : false;
				
				return isWrapped;
					
			},
			
			_preventDefault: function(e) {
				if ( e.preventDefault ) {
					e.preventDefault();
					e.stopPropagation();
				} else {
					e.returnValue = false;
				}
			},
			
			_closeOnNavClick: function () {
				if ( 'querySelectorAll' in document ) {
					var links = navList.querySelectorAll('a'),
						self = this;
					
					forEach(links, function (i, el) {
						addEvent(links[i], 'click', function (e) {
							e.preventDefault();
							e.stopPropagation();
							if (isCollapsed) {
								self.toggle();
								setTimeout( function () {
									window.location = links[i].href;
								}, 400);
							}
						}, false);
					});
				}
			}
			
		};
			
		return new FitNav(el, options);
	
	};
			
		
	window.fitNav = fitNav;
		

}(document, window, 0));