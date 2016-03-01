/**
 * @name DatePicker
 * @author Rick Hopkins
 *
 * @brief A Moo Tools Date Picker Widget
 *
 * @license MIT-style License.
 *
 * @ogo{188257854} added tab, esc to input to close datepicker.
 * Update to remove need for Compatiblity mode
 *
 * usage
    <input name="purchase_date"
        id="PurchaseDate"
        class="DatePicker"
        value="${item/purchase_date}"
        alt='{  "format":"yyyy-mm-dd",
                "yearStart": 1953,
                "yearRange": 100,
                "yearOrder":'desc'
            }' />

 *  common alt values:
 *      format:'mm/dd/yyyy','yyyy-mm-dd','yyyy.mm.dd','mm.dd.yyyy';
 *      yearRange: int;
 *      yearStart:YYYY;
 *      yearOrder:'desc','asc','mid';
 */

var DatePicker = new Class({
//
// set options
    options: {
        onShow: function(dp){ dp.setStyle('visibility', 'visible'); },
        onHide: function(dp){ dp.setStyle('visibility', 'hidden'); },
        className: 'DatePicker',
        monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        daysInMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
        dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        format: "yyyy-mm-dd",
        yearStart: new Date().getFullYear(),
        yearRange: 10,
        yearOrder: "mid",
        width: 155,
        position: "absolute",
        offsets: {'x':0, 'y':20},
        delay: 100,
        zIndex: 1000
    },

//
// setup the new DatePicker
    initialize: function(el, options){

        if (!el || el.retrieve('active')) return false;

        el.store('active', true);

        if (!$('DATEPICKER_CSS')) new Asset.css('/js/widgets/DatePicker/css/DatePicker.css', {id: 'DATEPICKER_CSS'});

        if (options) this.setOptions(options);
        else if (el.alt) {
            el.alt = el.alt.slice(1, -1);
            this.setOptions(JSON.decode(el.alt));
        }
        this.active = false;

        if (el.value.length > 9){
            switch (this.options.format){
                case 'mm/dd/yyyy':
                    d = el.value.split('/');
                    this.year = d[2].toInt();
                    (this.month = d[0].toInt() - 1);
                    this.day = d[1].toInt();
                break;
                case 'yyyy-mm-dd':
                    d = el.value.split('-');
                    this.year = d[0].toInt();
                    (this.month = d[1].toInt() - 1);
                    this.day = d[2].toInt();
                break;
                case 'yyyy.mm.dd':
                    d = el.value.split('.');
                    this.year = d[0].toInt();
                    (this.month = d[1].toInt() - 1);
                    this.day = d[2].toInt();
                break;
                case 'mm.dd.yyyy':
                    d = el.value.split('.');
                    this.year = d[2].toInt();
                    (this.month = d[0].toInt() - 1);
                    this.day = d[1].toInt();
                break;
                default:
                    d = new Date();
                    this.year = d.getFullYear();
                    this.month = d.getMonth();
                    this.day = d.getDate();
                break;
            }
        } else {
            d = new Date(); this.year = d.getFullYear(); this.month = d.getMonth(); this.day = d.getDate();
        }
    // Full Container
        this.dp =  new Element('div', {
            'class': this.options.className + '-Container',
            'styles': {
                'position':this.options.position,
                'top':'0',
                'left':'0',
                'z-index':this.options.zIndex,
                'visibility':'hidden'
            }
        }).inject(document.body);

    // Wrapper
        this.wrapper = new Element('div', {
            'class':this.options.className + '-Wrapper',
            'styles': {
                'position':'absolute',
                'width':this.options.width + 'px'
            }
        }).inject(this.dp);
        this.setup(el);
    },

//
// setup the calendar
    setup: function(el) {
        var destroy = this.destroy.bind(this);
        this.wrapper.addEvent('mouseleave', destroy);
        el.addEvents({
            focus: function(){
                this.position(el);
                this.build(el);
            }.bind(this),
            keypress: function(event){
                if(event.key=='esc' || event.key=='tab')  this.wrapper.empty();this.hide();
            }.bind(this),

        });
    },

//
// build the calendar
    build: function(el){
        this.wrapper.empty();
        date = new Date();
        date.setFullYear(this.year, this.month, 1);
        this.year % 4 == 0 ? this.options.daysInMonth[1] = 29 : this.options.daysInMonth[1] = 28;
        var firstDay = 1 - date.getDay();
    // month select
        monthSel = new Element('select', {'class':this.options.className + '-monthSelect'});
        for (var m = 0; m < this.options.monthNames.length; m++){
            monthSel.options[m] = new Option(this.options.monthNames[m], m);
            if (this.month == m) monthSel.options[m].selected = true;
        }
    // year select
        yearSel = new Element('select', {'class':this.options.className + '-yearSelect'});
        i = 0;
        if (this.options.yearOrder == 'desc'){
            for (var y = this.options.yearStart; y > (this.options.yearStart - this.options.yearRange - 1); y--){
                yearSel.options[i] = new Option(y, y);
                if (this.year == y) yearSel.options[i].selected = true;
                i++;
            }

        } else if (this.options.yearOrder == 'mid') {
            for (var y =this.options.yearStart + .5 * this.options.yearRange; y > (this.options.yearStart); y--){
                yearSel.options[i] = new Option(y, y);
                if (this.year == y) yearSel.options[i].selected = true;
                i++;
            }

            i=.5 * this.options.yearRange;
            for (var y =this.options.yearStart; y > (this.options.yearStart - .5 * this.options.yearRange - 1); y--){
                yearSel.options[i] = new Option(y, y);
                if (this.year == y) yearSel.options[i].selected = true;
                i++;
            }

        } else {
            for (var y = this.options.yearStart; y < (this.options.yearStart + this.options.yearRange + 1); y++){
                yearSel.options[i] = new Option(y, y);
                if (this.year == y) yearSel.options[i].selected = true;
                i++;
            }
        }
    //calendar table
        calTable = new Element('table', {'styles':{'width':'100%'}}).inject(this.wrapper);
        calTableTbody = new Element('tbody').inject(calTable);
        new Element('caption', {'class':'nav atc'})
                .adopt(monthSel)
                .adopt(yearSel)
                .inject(calTable);
    // day names
        calDayNameRow = new Element('tr').inject(calTableTbody);
        for (var i = 0; i < this.options.dayNames.length; i++){
            calDayNameCell = new Element('th', {'class':'dayName atc', 'styles':{'width':'14%'}})
                .set('text', this.options.dayNames[i].substr(0, 1)).inject(calDayNameRow);
        }
    // day cells
        date2 = new Date();
        while (firstDay <= this.options.daysInMonth[this.month]){
            calDayRow = new Element('tr').inject(calTableTbody);
            for (i = 0; i < 7; i++){
                if ((firstDay <= this.options.daysInMonth[this.month]) && (firstDay > 0)){
                    calDayCell = new Element('td',
                        {'class':'day', 'styles':{'cursor':'pointer', 'text-align':'center'},
                        'axis':this.year + '-' + (this.month + 1) + '-' + firstDay})
                        .set('text', firstDay).inject(calDayRow);
                    if (date2.getFullYear() == this.year && date2.getMonth() == this.month && date2.getDate() == firstDay) {
                        calDayCell.addClass('current');
                    }
                } else {
                    calDayCell = new Element('td', {'class':'empty'}).set('text', ' ').inject(calDayRow);
                }
                firstDay++;
            }
        }
    // onclick events for all calendar days
        $$('div.DatePicker-Wrapper td.day').each(function(d){
            d.onclick = function(){
                ds = d.axis.split('-');
                el.value = this.formatValue(ds[0], ds[1], ds[2]);
                this.hide();
            }.bind(this);
        }.bind(this));
    // onchange event for the month
        monthSel.onfocus = function(){ this.active = true; }.bind(this);
        monthSel.onblur = function(){ this.active = false; }.bind(this);
        monthSel.onchange = function(){
            this.month = monthSel.value.toInt();
            this.year = yearSel.value.toInt();
            el.value = this.formatValue(this.year, this.month + 1, 1);
            this.active = false;
            this.build(el);
        }.bind(this);
    // onchange event for the year
        yearSel.onfocus = function(){ this.active = true; }.bind(this);
        yearSel.onblur = function(){ this.active = false; }.bind(this);
        yearSel.onchange = function(){
            this.month = monthSel.value.toInt();
            this.year = yearSel.value.toInt();
            el.value = this.formatValue(this.year, this.month + 1, 1);
            this.active = false;
            this.build(el);
        }.bind(this);
        this.timer = this.show.delay(this.options.delay, this);
    },

//
// destroy the calendar
    destroy: function(event){
        this.timer = null;
        this.timer = this.hide.delay(this.options.delay, this);
    },

//
// position the calendar
    position: function(el){
        this.coords = el.getCoordinates();
        this.dp.setStyles({'top':this.coords.top + 'px', 'left':(this.coords.left + this.options.offsets.x) + 'px', 'width':this.coords.width + 'px', 'padding-top': this.coords.height + 'px'});
    },

//
// show the calendar
    show: function(){
        this.fireEvent('onShow', [this.dp]);
    },

//
// hide the calendar
    hide: function(){
        if (!this.active) this.fireEvent('onHide', [this.dp]);
    },

//
// format the returning date value
    formatValue: function(year, month, day){
        var dateStr = '';
    // length of day
        if (day < 10) day = '0' + day;
        if (month < 10) month = '0' + month;
    // format & replace parts // thanks O'Rey
        dateStr = this.options.format.replace( /dd/i, day ).replace( /mm/i, month ).replace( /yyyy/i, year );
        this.month = month.toInt() - 1;
        this.year = year.toInt();
    // return the date string value
        return dateStr;
    }
});

    DatePicker.implement(new Events);
    DatePicker.implement(new Options);

//
// create the DatePicker objects from input on load
    window.addEvent('domready', function(){
        var dps = $$('input.DatePicker');
        dps.each(function(el){
            new DatePicker(el);
        });
    });
