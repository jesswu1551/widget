let menu_data = {
  label: 'Example1', select: true, draggable: true, dragstart: 'dragStart',
  tool: [
    { name: 'filter', active: true, iconType: 'icon', icon: 'fa fa-search', title: true, placeholder: '請輸入 ...' },
    { name: 'insert', active: true, iconType: 'icon', icon: 'fa fa-plus' },
    { name: 'reload', active: true, iconType: 'icon', icon: 'fa fa-sync-alt' },
    { name: 'sort', active: true, iconType: 'icon', icon: 'fa fa-exchange-alt rotate', orderBy: 'default' },
  ],
  activeType: 'disabled', // 'visible' or 'disabled'
  item: [
    // item 1
    {
      id: 'ex1-item0001', label: 'Item0001', type: 'item', selected: false, icon: 'pipeline.png', tooltip: 'test',
      menu: [
        {
          mid: 'insert-group', label: 'Add', type: 'insert', active: true,
          menu: [
            { mid: 'insert-copy', label: 'Copy', type: 'copy', active: true },
            { mid: 'insert-paste', label: 'Paste', type: 'paste', active: false },
          ]
        },
        { mid: 'delete', label: 'Delete', type: 'delete', active: true },
      ]
    },
    // item 2
    {
      id: 'ex1-item0002', label: 'Item0002', type: 'item', selected: true, icon: 'pipeline.png', tooltip: 'test',
      menu: [
        { mid: 'insert', label: 'Add', type: 'insert', active: true },
        { mid: 'delete', label: 'Delete', type: 'delete', active: true },
      ]
    },
  ],
  srcpath: './img/',
  onAction: menu1Callback,
};

function groupData(list) {
  let opt = [];
  for (let i = 0, len = list.length; i < len; i++) {
    opt.push({ label: list[i], value: list[i] })
  }
  return opt;
}

// let leftopts = ['jid', 'parameter', 'created_time', 'score1', 'sign1', 'score2', 'sign2', 'distinct_value', 'same_direction', 'opp_direction'];
// let rightopts = ['jid2', 'parameter2', 'created_time2', 'score2', 'sign2', 'score2', 'sign2', 'distinct_value2', 'same_direction2', 'opp_direction2'];
let selector_data = {
  item: [{ left_value: '', left_label: '-', right_value: '', right_label: '-' }],
  item_min: 1,
  item_max: 3,
  left: groupData(leftopts),
  right: groupData(rightopts),
  string: { Left: '左資料表', Right: '右資料表' }
};


let slider_data = {
  item_min: 1,
  item_max: 3,
  item: [{ name: 'testing', from: 0, to: 100 }],
  item: [{ name: 'abc', from: 0, to: 50 }, { name: '123', from: 50, to: 75 }],
  item: [{ name: 'abc', from: 0, to: 25 }, { name: '123', from: 25, to: 75 }, { name: 'xyz', from: 75, to: 100 }],
  limit: { min: 0, max: 100 },
  replace: false
};

let menu_json = JSON.stringify(menu_data, undefined, 4);
$('#menu-data-body').text(menu_json);

let selector_json = JSON.stringify(selector_data, undefined, 4);
$('#selector-data-body').text(selector_json);

let slider_json = JSON.stringify(slider_data, undefined, 4);
$('#slider-data-body').text(slider_json);