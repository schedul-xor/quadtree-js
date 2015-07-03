goog.require('goog.dom');
goog.require('goog.json.Serializer');
goog.require('goog.ui.Button');
goog.require('goog.ui.LabelInput');
goog.require('goog.ui.Textarea');
goog.require('ol.TileCoord');
goog.require('schedul.qt.Base');
goog.require('schedul.qt.MapTree');
goog.require('schedul.qt.NodeStatus');



var qt = new schedul.qt.MapTree();

var input = new goog.ui.LabelInput('x/y/z');
input.render(goog.dom.getElement('input'));

var insertButton = new goog.ui.Button('insert');
insertButton.render(goog.dom.getElement('insert_button'));

var dumpTextarea = new goog.ui.Textarea('');
dumpTextarea.render(goog.dom.getElement('dump'));
var jsonSerializer = new goog.json.Serializer();

goog.events.listen(insertButton,goog.ui.Component.EventType.ACTION, function(e) {
  var insertTileStr = input.getValue();
  var a = insertTileStr.trim().split('/');
  var x = Number(a[0]);
  var y = Number(a[1]);
  var z = Number(a[2]);
  var tc = [z,x,y];

  qt.registerTileOutlineWithTile(tc);
  qt.overrideTileOutlineWithTile(tc,tc,schedul.qt.NodeStatus.IS_SURELY_LEAF);

  var dumpedValue = qt.dump();
  dumpTextarea.setValue(jsonSerializer.serialize(dumpedValue));
});
