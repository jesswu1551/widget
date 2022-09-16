let option1 = {
  label: 'Example1', select: true, draggable: true, dragstart: 'dragStart',
  tool: [
    { name: 'filter', active: true, iconType: 'icon', icon: 'fa fa-search', title: true, placeholder: '請輸入 ...' },
    { name: 'insert', active: true, iconType: 'icon', icon: 'fa fa-plus' },
    { name: 'reload', active: true, iconType: 'icon', icon: 'fa fa-sync-alt' },
    { name: 'sort', active: true, iconType: 'icon', icon: 'fa fa-exchange-alt rotate', orderBy: 'default' },
    // { name: 'sort', active: true, iconType: 'icon', icon: 'fa fa-sort-amount-down-alt', orderBy: 'asc' },
    // { name: 'sort', active: true, iconType: 'icon', icon: 'fa fa-sort-amount-down', orderBy: 'desc' },
    // { name: 'sort', active: true, iconType: 'icon', icon: 'fa fa-sort-alpha-down', orderBy: 'asc' },
  ],
  activeType: 'disabled', // 'visible' or 'disabled'
  item: [
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
        { mid: 'copy', label: 'Copy', type: 'copy', active: true },
        { mid: 'rename', label: 'Rename', type: 'rename', active: true },
        { mid: 'convert', label: 'Convert', type: 'convert', active: true },
        { mid: 'setting', label: 'Setting', type: 'setting', active: true },
        { mid: 'export', label: 'Export', type: 'export', active: true },
        {
          mid: 'info', label: 'Information', type: 'info', active: true,
          menu: [
            {
              mid: 'info-group', label: 'Info', type: 'info', active: true,
              menu: [
                { mid: 'info-info_group-info', label: 'Information', type: 'info', active: false },
                { mid: 'info-info_group-info2', label: 'Information2', type: 'info', active: true },
              ]
            },
            {
              mid: 'info-group2', label: 'Info2', type: 'info', active: true,
              menu: [
                { mid: 'info-info_group2-info', label: 'Information', type: 'info', active: true },
              ]
            },
          ]
        }
      ]
    },
    {
      id: 'ex1-item0002', label: 'Item0002', type: 'item', selected: true, icon: 'pipeline.png', tooltip: 'test',
      menu: [
        { mid: 'insert', label: 'Add', type: 'insert', active: true },
        { mid: 'delete', label: 'Delete', type: 'delete', active: true },
        { mid: 'copy', label: 'Copy', type: 'copy', active: true },
        { mid: 'paste', label: 'Paste', type: 'paste', active: false },
      ]
    },
    {
      id: 'ex1-item0003', label: 'Item0003', type: 'item', selected: false, icon: 'pipeline.png',
      menu: [
        { mid: 'insert', label: 'Add', type: 'insert', active: true },
        { mid: 'delete', label: 'Delete', type: 'delete', active: true },
        { mid: 'copy', label: 'Copy', type: 'copy', active: true },
        { mid: 'paste', label: 'Paste', type: 'paste', active: false },
      ]
    },
    {
      id: 'ex1-item0004', label: 'Item0004 test item name is too long', type: 'item', selected: false, icon: 'pipeline.png', rtooltip: 'testtesttesttesttesttesttestt<br>esttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttestteesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttestteststtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest',
      menu: [
        { mid: 'insert', label: 'Add', type: 'insert', active: true },
        { mid: 'delete', label: 'Delete', type: 'delete', active: true },
        { mid: 'copy', label: 'Copy', type: 'copy', active: true },
        { mid: 'paste', label: 'Paste', type: 'paste', active: false },
      ]
    },
    {
      id: 'ex1-item0005', label: 'Item0005', type: 'item', selected: false, icon: 'pipeline.png',
      menu: [
        { mid: 'insert', label: 'Add', type: 'insert', active: true },
        { mid: 'delete', label: 'Delete', type: 'delete', active: true },
        { mid: 'copy', label: 'Copy', type: 'copy', active: true },
        { mid: 'paste', label: 'Paste', type: 'paste', active: false },
      ]
    },
    {
      id: 'ex1-item0006', label: 'Item0006', type: 'item', selected: false, icon: 'pipeline.png', tooltip: 'test',
      menu: [
        { mid: 'insert', label: 'Add', type: 'insert', active: true },
        { mid: 'delete', label: 'Delete', type: 'delete', active: true },
        { mid: 'copy', label: 'Copy', type: 'copy', active: true },
        { mid: 'paste', label: 'Paste', type: 'paste', active: false },
      ]
    },
    {
      id: 'ex1-item0007', label: 'Item0007', type: 'item', selected: false, icon: 'pipeline.png', tooltip: 'test',
      menu: [
        { mid: 'insert', label: 'Add', type: 'insert', active: true },
        { mid: 'delete', label: 'Delete', type: 'delete', active: true },
        { mid: 'copy', label: 'Copy', type: 'copy', active: true },
        { mid: 'paste', label: 'Paste', type: 'paste', active: false },
      ]
    },
    {
      id: 'ex1-item0008', label: 'Item0008', type: 'item', selected: false, icon: 'pipeline.png',
      menu: [
        { mid: 'insert', label: 'Add', type: 'insert', active: true },
        { mid: 'delete', label: 'Delete', type: 'delete', active: true },
        { mid: 'copy', label: 'Copy', type: 'copy', active: true },
        { mid: 'paste', label: 'Paste', type: 'paste', active: false },
      ]
    },
    {
      id: 'ex1-item0009', label: 'Item0009', type: 'item', selected: false, icon: 'pipeline.png',
      menu: [
        { mid: 'insert', label: 'Add', type: 'insert', active: true },
        { mid: 'delete', label: 'Delete', type: 'delete', active: true },
        { mid: 'copy', label: 'Copy', type: 'copy', active: true },
        { mid: 'paste', label: 'Paste', type: 'paste', active: false },
      ]
    }],
  srcpath: './img/',
  onAction: menu1Callback,
};

let option11 = {
  label: 'Example1', select: true, draggable: true, dragstart: 'dragStart',
  tool: [
    { name: 'filter', active: false, iconType: 'icon', icon: 'fa fa-search', title: true, placeholder: '請輸入 ...' },
    { name: 'insert', active: false, iconType: 'icon', icon: 'fa fa-plus' },
    { name: 'reload', active: true, iconType: 'icon', icon: 'fa fa-sync-alt' },
    { name: 'sort', active: false, iconType: 'icon', icon: 'fa fa-exchange-alt rotate', orderBy: 'default' },
  ],
  activeType: 'disabled', // 'visible' or 'disabled'
  item: [
    {
      id: 'ex1-item0001', label: 'Item0001', type: 'item', selected: false, icon: 'pipeline.png', tooltip: 'test',
      menu: [
        { mid: 'delete', label: 'Delete', type: 'delete', active: true },
        { mid: 'copy', label: 'Copy', type: 'copy', active: true },
        { mid: 'rename', label: 'Rename', type: 'rename', active: true },
      ]
    },
    {
      id: 'ex1-item0002', label: 'Item0002', type: 'item', selected: true, icon: 'pipeline.png', tooltip: 'test',
      menu: [
        { mid: 'insert', label: 'Add', type: 'insert', active: true },
        { mid: 'delete', label: 'Delete', type: 'delete', active: true },
        { mid: 'copy', label: 'Copy', type: 'copy', active: true },
        { mid: 'paste', label: 'Paste', type: 'paste', active: false },
      ]
    }],
  srcpath: './img/',
  onAction: menu1Callback,
};

let option2 = {
  label: 'Example2', select: true, draggable: false, dragstart: 'dragStart',
  tool: [
    { name: 'filter', active: true, iconType: 'img', className: '', title: true, placeholder: '請輸入 ...' },
    { name: 'insert', active: true, iconType: 'img', className: 'custom-class miconmenu-insert-img' },
    { name: 'reload', active: true, iconType: 'img', className: '' },
    { name: 'sort', active: true, iconType: 'img', orderBy: 'default' },
  ],
  activeType: 'disabled', // 'visible' or 'disabled'
  item: [{
    id: 'group1', label: 'Group', type: 'branch', selected: false,
    menu: [
      { mid: 'group1-insert', label: 'Add', type: 'insert', active: true },
      { mid: 'group1-delete', label: 'Delete', type: 'delete', active: true },
      { mid: 'group1-copy', label: 'Copy', type: 'copy', active: true },
    ],
    subitems: [{
      id: 'ex2-item0001', label: 'Item000193432492384023fsdfd', type: 'branch', selected: false, tooltip: 'test',
      menu: [
        {
          mid: 'insert', label: 'Add', type: 'insert', active: true,
          menu: [
            { mid: 'insert-insert', label: 'Add', type: 'insert', active: true },
            { mid: 'insert-delete', label: 'Delete', type: 'delete', active: true },
            { mid: 'insert-copy', label: 'Copy', type: 'copy', active: true },
            { mid: 'insert-info', label: 'Information', type: 'info', active: true },
          ]
        },
        { mid: 'delete', label: 'Delete', type: 'delete', active: true },
        { mid: 'copy', label: 'Copy', type: 'copy', active: true },
        { mid: 'rename', label: 'Rename', type: 'rename', active: true },
        { mid: 'convert', label: 'Convert', type: 'convert', active: true },
        { mid: 'setting', label: 'Setting', type: 'setting', active: true },
        { mid: 'export', label: 'Export', type: 'export', active: true },
        { mid: 'info', label: 'Information', type: 'info', active: true }
      ],
      subitems: [{
        id: 'ex2-item0001001', label: 'Item0001-001', type: 'item', selected: false, icon: '',
        menu: [
          {
            mid: 'insert', label: 'Add', type: 'insert', active: true,
            menu: [
              { mid: 'insert-insert', label: 'Add', type: 'insert', active: true },
              { mid: 'insert-delete', label: 'Delete', type: 'delete', active: true },
            ]
          },
          { mid: 'delete', label: 'Delete', type: 'delete', active: true },
          { mid: 'copy', label: 'Copy', type: 'copy', active: true },
          { mid: 'info', label: 'Information', type: 'info', active: true }
        ],
      }]
    }, {
      id: 'ex2-item0002', label: 'Item0002', type: 'item', selected: false, tooltip: 'test', icon: '',
      menu: [
        { mid: 'insert', label: 'Add', type: 'insert', active: true },
        { mid: 'delete', label: 'Delete', type: 'delete', active: true },
        {
          mid: 'copy', label: 'Copy', type: 'copy', active: true,
          menu: [
            { mid: 'copy-rename', label: 'Rename', type: 'rename', active: false },
            { mid: 'copy-info', label: 'Information', type: 'info', active: true },
          ]
        },
        {
          mid: 'paste', label: 'Paste', type: 'paste', active: false,
          menu: [
            { mid: 'paste-setting', label: 'Setting', type: 'setting', active: true },
            { mid: 'paste-export', label: 'Export', type: 'export', active: true },
            { mid: 'paste-info', label: 'Information', type: 'info', active: true },
          ]
        }
      ]
    }, {
      id: 'ex2-item0003', label: 'Item0003', type: 'item', selected: false, icon: '',
      menu: [
        { mid: 'insert', label: 'Add', type: 'insert', active: true },
        { mid: 'delete', label: 'Delete', type: 'delete', active: true },
        { mid: 'copy', label: 'Copy', type: 'copy', active: true },
        { mid: 'paste', label: 'Paste', type: 'paste', active: false }]
    }]
  },
  {
    id: 'group2', label: 'Group2', type: 'branch', menu: null, selected: false,
    menu: [
      { mid: 'group1-insert', label: 'Add', type: 'insert', active: true },
      { mid: 'group1-delete', label: 'Delete', type: 'delete', active: true },
      { mid: 'group1-copy', label: 'Copy', type: 'copy', active: true },
    ],
    subitems: [{
      id: 'ex2-item0004', label: 'Item0001', type: 'branch', selected: false,
      menu: [
        { mid: 'insert', label: 'Add', type: 'insert', active: true },
        { mid: 'delete', label: 'Delete', type: 'delete', active: true },
        { mid: 'copy', label: 'Copy', type: 'copy', active: true },
        { mid: 'paste', label: 'Paste', type: 'paste', active: false }],
      subitems: [{
        id: 'ex2-item0004001', label: 'Item0004-001', type: 'item', selected: false, icon: '',
        menu: [
          { mid: 'insert', label: 'Add', type: 'insert', active: true },
          { mid: 'delete', label: 'Delete', type: 'delete', active: true },
          { mid: 'copy', label: 'Copy', type: 'copy', active: true },
          { mid: 'paste', label: 'Paste', type: 'paste', active: false }]
      }]
    }, {
      id: 'ex2-item0005', label: 'Item0002', type: 'item', selected: false, icon: '',
      menu: [
        { mid: 'insert', label: 'Add', type: 'insert', active: true },
        { mid: 'delete', label: 'Delete', type: 'delete', active: true },
        { mid: 'copy', label: 'Copy', type: 'copy', active: true },
        { mid: 'paste', label: 'Paste', type: 'paste', active: false }]
    }]
  },
  {
    id: 'item0006', label: 'Item0006', type: 'item', selected: false, icon: 'pipeline.png', tooltip: 'test',
    menu: [
      { mid: 'insert', label: 'Add', type: 'insert', active: true },
      { mid: 'delete', label: 'Delete', type: 'delete', active: true },
      { mid: 'copy', label: 'Copy', type: 'copy', active: true },
      { mid: 'paste', label: 'Paste', type: 'paste', active: false },
    ]
  },
  {
    id: 'item0007', label: 'Item0007', type: 'item', selected: false, icon: 'pipeline.png', tooltip: 'test',
    menu: [
      { mid: 'insert', label: 'Add', type: 'insert', active: true },
      { mid: 'delete', label: 'Delete', type: 'delete', active: true },
      { mid: 'copy', label: 'Copy', type: 'copy', active: true },
      { mid: 'paste', label: 'Paste', type: 'paste', active: false },
    ]
  },
  {
    id: 'item0008', label: 'Item0008', type: 'item', selected: false, icon: 'pipeline.png',
    menu: [
      { mid: 'insert', label: 'Add', type: 'insert', active: true },
      { mid: 'delete', label: 'Delete', type: 'delete', active: true },
      { mid: 'copy', label: 'Copy', type: 'copy', active: true },
      { mid: 'paste', label: 'Paste', type: 'paste', active: false },
    ]
  },
  {
    id: 'group3', label: 'Group3', type: 'branch', menu: null, selected: false,
    subitems: [{
      id: 'ex2-item0006', label: 'Item0001', type: 'item', selected: false, tooltip: 'test',
      menu: [
        { mid: 'insert', label: 'Add', type: 'insert', active: false },
        { mid: 'delete', label: 'Delete', type: 'delete', active: false },
        { mid: 'copy', label: 'Copy', type: 'copy', active: false },
        { mid: 'paste', label: 'Paste', type: 'paste', active: false }]
    }, {
      id: 'ex2-item0007', label: 'Item0002', type: 'item', selected: false, tooltip: 'test',
      menu: [
        { mid: 'insert', label: 'Add', type: 'insert', active: false },
        { mid: 'delete', label: 'Delete', type: 'delete', active: false },
        { mid: 'copy', label: 'Copy', type: 'copy', active: false },
        { mid: 'paste', label: 'Paste', type: 'paste', active: false }]
    }],
  },
  {
    id: 'item0009', label: 'Item0009', type: 'item', selected: false, icon: 'pipeline.png',
    menu: [
      { mid: 'insert', label: 'Add', type: 'insert', active: true },
      { mid: 'delete', label: 'Delete', type: 'delete', active: true },
      { mid: 'copy', label: 'Copy', type: 'copy', active: true },
      { mid: 'paste', label: 'Paste', type: 'paste', active: false },
    ]
  }],
  onAction: function (item, data) {
    console.log(item, data);
    if (item === 'selectcontext') {
      if (data.type === 'copy') {
        $('#example2 .miconmenu-item-btn').attr('data-paste', true);
        // $(`#${data.id}-btn`).attr('data-paste', true);
      } else if (data.type === 'paste') {
        $('#example2 .miconmenu-item-btn').attr('data-paste', false);
        // $(`#${data.id}-btn`).attr('data-paste', true);
      }
    } else if (item === 'selectmenu') {
      if (data.type === 'sort') {
        let sortObj = { className: '', orderBy: '' };
        if (data.orderBy === 'default') {
          // regroup data...
          sortObj.className = 'miconmenu-sort-img sort-asc';
          sortObj.orderBy = 'asc';
        } else if (data.orderBy === 'asc') {
          // regroup data...
          sortObj.className = 'miconmenu-sort-img sort-desc';
          sortObj.orderBy = 'desc';
        } else if (data.orderBy === 'desc') {
          // regroup data...
          sortObj.className = 'miconmenu-sort-img sort-default';
          sortObj.orderBy = 'default';
        }
        let tools = [
          { name: 'filter', active: true, iconType: 'img', className: '', title: true, placeholder: '請輸入 ...' },
          { name: 'insert', active: true, iconType: 'img', className: 'custom-class miconmenu-insert-img' },
          { name: 'reload', active: true, iconType: 'img' },
          { name: 'sort', active: true, iconType: 'img', orderBy: sortObj.orderBy, className: sortObj.className },
        ]

        Object.assign(option2.tool, tools);
        miconmenu2.update(option2);
      }
    }
  },
  srcpath: './img/',
};

let leftopts = ['jid', 'parameter', 'created_time', 'score1', 'sign1', 'score2', 'sign2', 'distinct_value', 'same_direction', 'opp_direction'];
let rightopts = ['jid2', 'parameter2', 'created_time2', 'score2', 'sign2', 'score2', 'sign2', 'distinct_value2', 'same_direction2', 'opp_direction2'];
let sel_options = {
  item: [{ left_value: '', left_label: '-', right_value: '', right_label: '-' }],
  item_min: 1,
  item_max: 3,
  left: groupData(leftopts),
  right: groupData(rightopts),
  string: { Left: '左資料表', Right: '右資料表' }
};

let sli_options = {
  item_min: 1,
  item_max: 3,
  item: [{ name: 'testing', from: 0, to: 100 }],
  // item: [{ name: 'abc', from: 0, to: 50 }, { name: '123', from: 50, to: 75 }],
  // item: [{ name: 'abc', from: 0, to: 25 }, { name: '123', from: 25, to: 75 }, { name: 'xyz', from: 75, to: 100 }],
  limit: { min: 0, max: 100 },
  replace: false
};

let miconmenu1 = new wx.mIconMenu('#example1', {});
let miconmenu2 = new wx.mIconMenu('#example2', {});
let selector1 = new wx.mSelector('#mselector1', sel_options);
let selector2 = new wx.mSelector('#mselector2', sel_options);
let msliders1 = new wx.mSliders('#msliders1', sli_options);
let msliders2 = new wx.mSliders('#msliders2', sli_options);

function menu1Callback(item, data) {
  console.log(item, data);
  if (item === 'selectcontext') {
    if (data.type === 'copy') {
      // $('#example1 .miconmenu-item-btn').attr('data-paste', true);
      $(`#${data.id}-btn`).attr('data-paste', true);
    } else if (data.type === 'paste') {
      // $('#example1 .miconmenu-item-btn').attr('data-paste', false);
      $(`#${data.id}-btn`).attr('data-paste', false);
    }
  } else if (item === 'selectmenu') {
    if (data.type === 'sort') {
      let sortObj = { icon: '', orderBy: '' };
      if (data.orderBy === 'default') {
        // regroup data...
        sortObj.icon = 'fa fa-sort-amount-down-alt';
        sortObj.orderBy = 'asc';
      } else if (data.orderBy === 'asc') {
        // regroup data...
        sortObj.icon = 'fa fa-sort-amount-down';
        sortObj.orderBy = 'desc';
      } else if (data.orderBy === 'desc') {
        // regroup data...
        sortObj.icon = 'fa fa-exchange-alt rotate';
        sortObj.orderBy = 'default';
      }
      let tools = [
        { name: 'filter', active: true, iconType: 'icon', icon: 'fa fa-search', title: true, placeholder: '請輸入 ...' },
        { name: 'insert', active: true, iconType: 'icon', icon: 'fa fa-plus' },
        { name: 'reload', active: true, iconType: 'icon', icon: 'fa fa-sync-alt' },
        { name: 'sort', active: true, iconType: 'icon', icon: sortObj.icon, orderBy: sortObj.orderBy },
        // { name: 'sort', active: true, iconType: 'icon', icon: 'fa fa-sort-amount-down-alt', orderBy: 'asc' },
        // { name: 'sort', active: true, iconType: 'icon', icon: 'fa fa-sort-amount-down', orderBy: 'desc' },
      ]
      Object.assign(option1.tool, tools);
      miconmenu1.update(option1);
    }
  }
}

function groupData(list) {
  let opt = [];
  for (let i = 0, len = list.length; i < len; i++) {
    opt.push({ label: list[i], value: list[i] })
  }
  return opt;
}

$('#clear-menu1').on('click', function (e) {
  miconmenu1.clear();
});
$('#update-menu1').on('click', function (e) {
  miconmenu1.clear();
  miconmenu1.update(option1);
});
$('#update-menu11').on('click', function (e) {
  miconmenu1.clear();
  miconmenu1.update(option11);
});

$('#update-context').on('click', function (e) {
  miconmenu1.updateContextMenu('paste', true);
  miconmenu1.updateContextMenu('copy', false);
});
$('#clear-menu2').on('click', function (e) {
  miconmenu2.clear();
});
$('#update-menu2').on('click', function (e) {
  miconmenu2.clear();
  miconmenu2.update(option2);
});

$('#clear-selector1').on('click', function (e) {
  selector1.clear();
});
$('#update-selector1').on('click', function (e) {
  let options = {
    item: [{
      left_value: 'item3', left_label: 'item3', right_value: 'itemD', right_label: 'itemD'
    }, {
      left_value: 'item1', left_label: 'item1', right_value: 'itemE', right_label: 'itemE'
    }
    ],
    item_min: 1,
    item_max: 3,
    left: groupData(['item1', 'item2', 'item3', 'item4', 'item5']),
    right: groupData(['itemA', 'itemB', 'itemC', 'itemD', 'itemE']),
  };
  selector1.update(sel_options);
});
$('#get-selector1').on('click', function (e) {
  let setting = selector1.getItems();
  console.log(setting);

  selector2.update({ item: setting });
});
$('#clear-selector2').on('click', function (e) {
  selector2.clear();
});
$('#update-selector2').on('click', function (e) {
  let sel_options = {
    item: [{
      left_value: 'jid', left_label: 'jid', right_value: 'created_time2', right_label: 'created_time2'
    }, {
      left_value: 'sign2', left_label: 'sign2', right_value: 'parameter2', right_label: 'parameter2'
    }],
  };
  selector2.update(sel_options);
});

$('#clear-sliders1').on('click', function (e) {
  msliders1.clear();
});
$('#update-sliders1').on('click', function (e) {
  let sli_options = {
    item_min: 1,
    item_max: 3,
    item: [{ name: '', from: 0, to: 100 }],
    limit: { min: 0, max: 100 },
    replace: true
  };
  msliders1.update(sli_options);
});

$('#get-sliders1').on('click', function (e) {
    let res = msliders1.getItems();
    console.log(res);
  });

$('#clear-sliders2').on('click', function (e) {
  msliders2.clear();
});
$('#update-sliders2').on('click', function (e) {
  msliders2.update(sli_options);
});
