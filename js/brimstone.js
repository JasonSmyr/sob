
var CharacterSheet = React.createClass({

	getInitialState: function () {
		//localStorage.removeItem("brimstoneCharacterData");
		return {
			loaded: false,
			characterData: null,
			characterClasses: [],
			characterKeywords: [],
			charOne: null,
			charTwo: null,
			activePanel: "items"
		};
	},

	componentDidMount: function () {

		var local = localStorage.getItem('brimstoneCharacterData');

		var c1 = localStorage.getItem('charOne');
		var c2 = localStorage.getItem('charTwo');

		if (c1 !== null) {
			this.setState({
				charOne: JSON.parse(c1)
			});
		}

		if (c2 !== null) {
			this.setState({
				charTwo: JSON.parse(c2)
			});
		}

		if (local !== null) {
			//Debugging load from localStorage
			console.log(local);

			var characterData = localStorage.getItem('brimstoneCharacterData')
			this.setState({
				characterData: JSON.parse(characterData)
			});
		}
		else {
			this.serverRequest = $.get('/sob/brimstone_base.json', function (result) {
				this.setState({
					characterData: result
				});
			}.bind(this));
		}

		if (this.state.characterClasses.length === 0) {
			this.serverRequest = $.get('/sob//brimstone_classes.json', function (result) {
				this.setState({
					characterClasses: result.classes
				});
			}.bind(this));
		}

		if (this.state.characterKeywords.length === 0) {
			this.serverRequest = $.get('/sob/brimstone_keywords.json', function (result) {
				this.setState({
					characterKeywords: result.keywords
				});
			}.bind(this));
		}


		this.setState({
			loaded: true
		});


	},

	componentDidUpdate: function (prevProps, prevState) {
		if (this.state.characterData !== null) {
			localStorage.setItem('brimstoneCharacterData', JSON.stringify(this.state.characterData));
		}

	},

	loadCharacter: function () {
		//Debugging input
		console.log(local);

		var characterData = localStorage.getItem('brimstoneCharacterData')

		this.setState({
			characterData: JSON.parse(characterData),
			loaded: true
		});
	},

	onUpdate: function (field, value) {
		//Debugging input
		console.log(value);

		var data = this.state.characterData;
		data[field] = value;

		this.setState({
			characterData: data
		});
	},

	calcBonus: function (stat) {
		var bonus = 0;
		var items = this.state.characterData.items.filter(x => x.equipped === true);

		if (items.length > 0) {
			items.map((item) => (
				bonus += +item.bonus[stat]
			)
			)
		}

		return (
			+bonus
		);
	},

	onActivePanelUpdate: function (value) {
		this.setState({ activePanel: value });
	},

	onStatsUpdate: function (field, value) {
		//Debugging input
		console.log(value);

		var data = this.state.characterData;
		data.baseStats[field] = value;

		this.setState({
			characterData: data
		});
	},

	onCountersUpdate: function (field, value) {
		//Debugging input
		console.log(value);

		var data = this.state.characterData;
		data.counters[field] = value;

		this.setState({
			characterData: data
		});
	},

	onSideBagUpdate: function (field, value) {
		//Debugging input
		console.log(value);

		var data = this.state.characterData;
		data.sideBag[field] = value;

		this.setState({
			characterData: data
		});
	},

	onItemsUpdate: function (value) {
		//Debugging input
		console.log(value);

		var data = this.state.characterData;
		data.items = value;

		this.setState({
			characterData: data
		});
	},

	onSaveOne: function () {
		var cData = this.state.characterData;

		if (this.state.charOne === null || cData.name == this.state.charOne.name) {
			localStorage.setItem('charOne', JSON.stringify(cData));
			var cOne = JSON.parse(localStorage.getItem('charOne'))
			this.setState({
				charOne: cOne
			});
		}
		else {
			localStorage.setItem('charTwo', JSON.stringify(this.state.characterData));
			var cOne = JSON.parse(localStorage.getItem('charOne'));
			this.setState({
				charTwo: cData,
				charOne: cOne,
				characterData: cOne
			});
		}
	},

	onSaveTwo: function () {
		var cData = this.state.characterData;

		if (this.state.charTwo === null || cData.name == this.state.charTwo.name) {
			localStorage.setItem('charTwo', JSON.stringify(cData));
			var cTwo = JSON.parse(localStorage.getItem('charTwo'));
			this.setState({
				charTwo: cTwo
			});
		}
		else {
			localStorage.setItem('charOne', JSON.stringify(this.state.characterData));
			var cTwo = JSON.parse(localStorage.getItem('charTwo'));
			this.setState({
				charTwo: cTwo,
				charOne: cData,
				characterData: cTwo
			});
		}
	},

	onExport: function () {
		var data, filename, link;
     
		var csv=JSON.stringify(localStorage)
        filename = 'sob.json';

        if (!csv.match(/^data:text\/csv/i)) {
            csv = 'data:text/csv;charset=utf-8,' + csv;
        }
        data = encodeURI(csv);

        link = document.createElement('a');
        link.setAttribute('href', data);
        link.setAttribute('download', filename);
        link.click();
	},
	

	render: function () {
		if (this.state.loaded) {
			var characterData = this.state.characterData;

			var charOne = "<click to set>";
			var charTwo = "<click to set>";

			var one = this.state.charOne;
			var two = this.state.charTwo;

			if (one !== null && one.name !== null)
				charOne = one.name;

			if (two !== null && two.name !== null)
				charTwo = two.name;

			return (
				<div>
					<img src={'img/shadows_halfsheet.jpg'} width={'1492'} height={'936'} />
					<div id="menubar" className="menuButtons">
						<button onClick={this.onSaveOne} >{charOne}</button>
						<button onClick={this.onSaveTwo} >{charTwo}</button>
						<button onClick={this.onExport} >Download Characters</button>
						<ImportButtonModal id="name" className="text" data={characterData.name} onUpdate={this.onUpdate} maxLength="28" />
					</div>
					<EditNameModal id="name" className="text" data={characterData.name} onUpdate={this.onUpdate} maxLength="28" />
					<EditClassModal id="class" className="text" data={characterData.class} options={this.state.characterClasses} onUpdate={this.onUpdate} />
					<EditKeywordsModal id="keywords" className="editKeywordsModal" data={characterData.keywords} options={this.state.characterKeywords} onUpdate={this.onUpdate} />

					<EditStatsModal id="level" className="stats" data={this.state.characterData.baseStats.level || "0"} bonus="0" onUpdate={this.onStatsUpdate} maxLength="2" />
					<EditStatsModal id="initiative" className="stats" data={this.state.characterData.baseStats.initiative || "0"} bonus={this.calcBonus("initiative")} onUpdate={this.onStatsUpdate} maxLength="2" />
					<EditStatsModal id="combat" className="stats" data={this.state.characterData.baseStats.combat || "0"} bonus={this.calcBonus("combat")} onUpdate={this.onStatsUpdate} maxLength="2" />
					<EditStatsModal id="melee" className="stats" plus="plus" data={this.state.characterData.baseStats.melee || "0"} bonus={this.calcBonus("melee")} onUpdate={this.onStatsUpdate} maxLength="2" />
					<EditStatsModal id="range" className="stats" plus="plus" data={this.state.characterData.baseStats.range || "0"} bonus={this.calcBonus("range")} onUpdate={this.onStatsUpdate} maxLength="2" />

					<EditStatsModal id="agility" className="stats" data={this.state.characterData.baseStats.agility || "0"} bonus={this.calcBonus("agility")} onUpdate={this.onStatsUpdate} maxLength="2" />
					<EditStatsModal id="cunning" className="stats" data={this.state.characterData.baseStats.cunning || "0"} bonus={this.calcBonus("cunning")} onUpdate={this.onStatsUpdate} maxLength="2" />
					<EditStatsModal id="spirit" className="stats" data={this.state.characterData.baseStats.spirit || "0"} bonus={this.calcBonus("spirit")} onUpdate={this.onStatsUpdate} maxLength="2" />
					<EditStatsModal id="strength" className="stats" data={this.state.characterData.baseStats.strength || "0"} bonus={this.calcBonus("strength")} onUpdate={this.onStatsUpdate} maxLength="2" />
					<EditStatsModal id="lore" className="stats" data={this.state.characterData.baseStats.lore || "0"} bonus={this.calcBonus("lore")} onUpdate={this.onStatsUpdate} maxLength="2" />
					<EditStatsModal id="luck" className="stats" data={this.state.characterData.baseStats.luck || "0"} bonus={this.calcBonus("luck")} onUpdate={this.onStatsUpdate} maxLength="2" />
					<EditStatsModal id="defense" className="stats" plus="plus" data={this.state.characterData.baseStats.defense || "0"} bonus={this.calcBonus("defense")} onUpdate={this.onStatsUpdate} maxLength="2" />
					<EditStatsModal id="willpower" className="stats" plus="plus" data={this.state.characterData.baseStats.willpower || "0"} bonus={this.calcBonus("willpower")} onUpdate={this.onStatsUpdate} maxLength="2" />
					<EditStatsModal id="maxHealth" className="stats" data={this.state.characterData.baseStats.maxHealth || "0"} bonus={this.calcBonus("maxHealth")} onUpdate={this.onStatsUpdate} maxLength="2" />
					<EditStatsModal id="maxSanity" className="stats" data={this.state.characterData.baseStats.maxSanity || "0"} bonus={this.calcBonus("maxSanity")} onUpdate={this.onStatsUpdate} maxLength="2" />
					<EditStatsModal id="maxGrit" className="stats" data={this.state.characterData.baseStats.maxGrit || "0"} bonus={this.calcBonus("maxGrit")} onUpdate={this.onStatsUpdate} maxLength="2" />

					<EditStatsModal id="wound" className="counters" data={this.state.characterData.counters.wound || "0"} bonus="0" onUpdate={this.onCountersUpdate} maxLength="2" />
					<EditStatsModal id="sanity" className="counters" data={this.state.characterData.counters.sanity || "0"} bonus="0" onUpdate={this.onCountersUpdate} maxLength="2" />
					<EditStatsModal id="grit" className="counters" data={this.state.characterData.counters.grit || "0"} bonus="0" onUpdate={this.onCountersUpdate} maxLength="2" />
					<EditStatsModal id="corruption" className="counters" data={this.state.characterData.counters.corruption || "0"} bonus="0" onUpdate={this.onCountersUpdate} maxLength="2" />
					<EditXpModal id="xp" className="counters" data={this.state.characterData.counters.xp || "0"} bonus="0" onUpdate={this.onCountersUpdate} maxLength="5" />
					<EditGoldModal id="gold" className="counters" data={this.state.characterData.counters.gold || "0"} bonus="0" onUpdate={this.onCountersUpdate} maxLength="5" />
					<EditStatsModal id="darkstone" className="counters" data={this.state.characterData.counters.darkstone || "0"} bonus="0" onUpdate={this.onCountersUpdate} maxLength="2" />

					<EditSideBagModal id="bandages" className="counters" data={this.state.characterData.sideBag.bandages || "0"} onUpdate={this.onSideBagUpdate} maxLength="2" />
					<EditSideBagModal id="tonic" className="counters" data={this.state.characterData.sideBag.tonic || "0"} onUpdate={this.onSideBagUpdate} maxLength="2" />
					<EditSideBagModal id="dynamite" className="counters" data={this.state.characterData.sideBag.dynamite || "0"} onUpdate={this.onSideBagUpdate} maxLength="2" />
					<EditSideBagModal id="whiskey" className="counters" data={this.state.characterData.sideBag.whiskey || "0"} onUpdate={this.onSideBagUpdate} maxLength="2" />
					<EditSideBagModal id="herbs" className="counters" data={this.state.characterData.sideBag.herbs || "0"} onUpdate={this.onSideBagUpdate} maxLength="2" />
					<EditSideBagModal id="flash" className="counters" data={this.state.characterData.sideBag.flash || "0"} onUpdate={this.onSideBagUpdate} maxLength="2" />

					<ItemsAbilitysInjuries onActivePanelUpdate={this.onActivePanelUpdate} activePanel={this.state.activePanel} />
					<ItemsPanel id="items" className="itemsPanel" data={this.state.characterData.items || []} onUpdate={this.onItemsUpdate} activePanel={this.state.activePanel} />
					<AbilitiesPanel id="abilities" className="abilitiesPanel" data={this.state.characterData.abilities || []} onUpdate={this.onAbilitiesUpdate} activePanel={this.state.activePanel} />
					<InjuriesPanel id="injuries" className="injuriesPanel" data={this.state.characterData.injuries || []} onUpdate={this.onInjuriesUpdate} activePanel={this.state.activePanel} />
				</div>
			);
		}
		else {
			return (
				<div>
				</div>
			);
		}
	}
});

var ImportButtonModal = React.createClass({
	getInitialState: function () {
		return {
			editing: false,
			text: null,
			showModal: false,
			diceValue: 0,
			goldValue: 0
		};
	},
	componentDidMount: function () {
		window.addEventListener('mousedown', this.pageClick, false);

	},
	pageClick: function (e) {
		if ($(event.target).closest('#modalbox').length) {
			return;
		}

		this.setState({
			editing: false,
			text: null,
			showModal: false
		});
	},
	onClick: function (e) {

		this.setState({
			editing: true,
			showModal: true
		});
	},
	onChange: function (e) {
		this.props.onUpdate(this.props.id, e.target.value);
	},
	onKeyPress: function (e) {
		if (e.key === 'Enter') {
			this.setState({
				editing: false,
				showModal: false
			});
		}
	},
	onHide: function (e) {
		this.setState({
			editing: false,
			showModal: false
		});
	},
	close() {
		this.setState({ editing: false, showModal: false });
	},
	open() {
		this.setState({ editing: true, showModal: true });
	},
	render: function () {
		var fontSize = 18;

		if (this.props.data.length > 0) {
			fontSize = 60
		}
		if (this.props.data.length >= 11) {
			fontSize = 40
		}

		if (this.props.data.length >= 17) {
			fontSize = 32
		}

		if (this.props.data.length >= 22) {
			fontSize = 18
		}

		if (this.state.editing) {
			var cssClasses = this.props.className;

			return (
				<div>
					<div id={this.props.id} className={this.props.className} onClick={this.onClick} style={{ fontSize: fontSize }}>
						<span style={{ lineHeight: "50px" }}>{this.props.data || "Click to edit name"}</span>
					</div>
					<div className="modalbox">
						<div id="modalbox" className="modaltext editLargeModal">
							<div style={{ width: '100%', height: "150px" }}>
								<div style={{ width: '100%' }}>
									<span style={{ fontSize: "100%" }}>Don't Use, does not work</span>
									<div>
										<input id="nameInput" type="text" value={this.props.data} onChange={this.onChange} onKeyPress={this.onKeyPress} style={{ fontSize: "36", width: "90%", Height: "50px" }} />
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)
		}
		else {
			return (
				<button onClick={this.onClick} >Import Character</button>
			);
		}
	}
});

var EditNameModal = React.createClass({
	getInitialState: function () {
		return {
			editing: false,
			text: null,
			showModal: false,
			diceValue: 0,
			goldValue: 0
		};
	},
	componentDidMount: function () {
		window.addEventListener('mousedown', this.pageClick, false);

	},
	pageClick: function (e) {
		if ($(event.target).closest('#modalbox').length) {
			return;
		}

		this.setState({
			editing: false,
			text: null,
			showModal: false
		});
	},
	onClick: function (e) {

		this.setState({
			editing: true,
			showModal: true
		});
	},
	onChange: function (e) {
		this.props.onUpdate(this.props.id, e.target.value);
	},
	onKeyPress: function (e) {
		if (e.key === 'Enter') {
			this.setState({
				editing: false,
				showModal: false
			});
		}
	},
	onHide: function (e) {
		this.setState({
			editing: false,
			showModal: false
		});
	},
	close() {
		this.setState({ editing: false, showModal: false });
	},
	open() {
		this.setState({ editing: true, showModal: true });
	},
	render: function () {
		var fontSize = 40;

		if (this.props.data.length > 0) {
			fontSize = 60
		}
		if (this.props.data.length >= 11) {
			fontSize = 40
		}

		if (this.props.data.length >= 17) {
			fontSize = 32
		}

		if (this.props.data.length >= 22) {
			fontSize = 18
		}

		if (this.state.editing) {
			var cssClasses = this.props.className;

			return (
				<div>
					<div id={this.props.id} className={this.props.className} onClick={this.onClick} style={{ fontSize: fontSize }}>
						<span style={{ lineHeight: "50px" }}>{this.props.data || "Click to edit name"}</span>
					</div>
					<div className="modalbox">
						<div id="modalbox" className="modaltext editSmallModal">
							<div style={{ width: '100%', height: "150px" }}>
								<div style={{ width: '100%' }}>
									<span style={{ fontSize: "100%" }}>Enter your character name:</span>
									<div>
										<input id="nameInput" type="text" value={this.props.data} onChange={this.onChange} onKeyPress={this.onKeyPress} style={{ fontSize: "36", width: "90%", Height: "50px" }} />
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)
		}
		else {
			return (
				<div id={this.props.id} className={this.props.className} onClick={this.onClick} style={{ fontSize: fontSize }}>
					<span style={{ lineHeight: "50px" }}>{this.props.data || "Click to edit name1"}</span>
				</div>
			);
		}
	}
});

var EditClassModal = React.createClass({
	getInitialState: function () {
		return {
			editing: false,
			text: null,
			showModal: false,
			diceValue: 0,
			goldValue: 0
		};
	},
	componentDidMount: function () {
		window.addEventListener('mousedown', this.pageClick, false);
	},
	pageClick: function (e) {
		if ($(event.target).closest('#modalbox').length) {
			return;
		}

		this.setState({
			editing: false,
			text: null,
			showModal: false
		});
	},
	onClick: function (e) {

		this.setState({
			editing: true,
			showModal: true
		});
	},
	onChange: function (e) {
		this.props.onUpdate(this.props.id, e.target.value);
	},
	onKeyPress: function (e) {
		if (e.key === 'Enter') {
			this.setState({
				editing: false,
				showModal: false
			});
		}
	},
	onHide: function (e) {
		this.setState({
			editing: false,
			showModal: false
		});
	},
	close() {
		this.setState({ editing: false, showModal: false });
	},
	open() {
		this.setState({ editing: true, showModal: true });
	},
	render: function () {


		if (this.state.editing) {
			var optionNodes = this.props.options.map(function (option) {
				return (
					<option value={option}>{option}</option>
				);
			});

			return (
				<div>
					<div id={this.props.id} className={this.props.className} onClick={this.onClick}>
						{this.props.data}
					</div>

					<div className="modalbox">
						<div id="modalbox" className="text editSmallModal">
							<div style={{ width: '100%', height: "150px" }}>
								<div style={{ width: '100%' }}>
									<span style={{ fontSize: "120%" }}>Choose your character class:</span>
									<br />
									<select value={this.props.data} onChange={this.onChange} onBlur={this.onBlur} onKeyPress={this.onKeyPress} style={{ width: '90%', marginTop: "20px" }}>
										{optionNodes}
									</select>
								</div>
							</div>
						</div>
					</div>
				</div>
			)
		}
		else {
			return (
				<div id={this.props.id} className={this.props.className} onClick={this.onClick}>
					{this.props.data}
				</div>
			);
		}
	}
});

var EditKeywordsModal = React.createClass({
	getInitialState: function () {
		return {
			editing: false,
			text: null,
			showModal: false
		};
	},
	componentDidMount: function () {
		window.addEventListener('mousedown', this.pageClick, false);
	},
	pageClick: function (e) {
		if ($(event.target).closest('#modalbox').length) {
			return;
		}

		this.setState({
			editing: false,
			text: null,
			showModal: false
		});
	},
	onClick: function (e) {

		this.setState({
			editing: true,
			showModal: true
		});
	},
	onChange: function (e) {

		var keywords = [];

		$("input:checkbox[name=keywords]:checked").each(function () {
			keywords.push($(this).val());
		});

		this.props.onUpdate(this.props.id, keywords);
	},
	onKeyPress: function (e) {
		if (e.key === 'Enter') {
			this.setState({
				editing: false,
				showModal: false
			});
		}
	},
	onHide: function (e) {
		this.setState({
			editing: false,
			showModal: false
		});
	},
	close() {
		this.setState({ editing: false, showModal: false });
	},
	open() {
		this.setState({ editing: true, showModal: true });
	},
	render: function () {

		var keywords = this.props.data.join(", ");
		var fontSize = 26;

		if (keywords.length === 0) {
			keywords = "Click to edit keywords";
		}

		if (keywords.length > 18) {
			fontSize = 28
		}

		if (keywords.length > 23) {
			fontSize = 24
		}

		if (keywords.length > 28) {
			fontSize = 18
		}

		if (this.state.editing) {
			var checkboxNodes = [];

			var that = this;

			this.props.options.map(function (option) {

				var checked = $.inArray(option, that.props.data) >= 0 ? "checked" : "";

				var newObj = <label><input type="checkbox" name="keywords" value={option} checked={checked} />{option}</label>;

				checkboxNodes.push(newObj);

				newObj = "  ";
				checkboxNodes.push(newObj);
			});

			var cssClasses = this.props.className;
			cssClasses += " editingMulti";

			return (
				<div>
					<div id={this.props.id} className={this.props.className} style={{ fontSize: fontSize }}>
						{keywords}
					</div>

					<div className="modalbox">
						<div id="modalbox" className="text editLargeModal" style={{ height: "300px" }}>
							<div style={{ width: '100%' }}>
								<div style={{ width: '90%', margin: "auto" }}>
									<span style={{ fontSize: "140%" }}>Select your Keywords:</span>
									<br />
									<div className="form-group" onChange={this.onChange} style={{ marginTop: "20px" }}>
										{checkboxNodes}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)
		}
		else {
			return (
				<div id={this.props.id} className={this.props.className} onClick={this.onClick} style={{ fontSize: fontSize }}>
					{keywords}
				</div>

			);
		}
	}
});

var EditGoldModal = React.createClass({
	getInitialState: function () {
		return {
			editing: false,
			text: null,
			showModal: false,
			diceValue: 1,
			goldValue: 0
		};
	},
	componentDidMount: function () {
		window.addEventListener('mousedown', this.pageClick, false);
	},
	calculate: function () {

		var calc = +this.state.diceValue * +this.state.goldValue;

		if (calc > 0) {
			this.setState({ text: calc });
		}

	},
	pageClick: function (e) {
		if ($(event.target).closest('#modalbox').length) {
			return;
		}

		this.setState({
			editing: false,
			text: null,
			showModal: false
		});
	},
	onClick: function (e) {

		this.setState({
			editing: true,
			showModal: true
		});
	},
	onChange: function (e) {
		const change = e.target.value;
		this.setState({ text: change });
	},
	onDiceChange: function (e) {
		const change = e.target.value;
		this.setState({ diceValue: change });
	},
	onGoldChange: function (e) {
		const change = e.target.value;
		this.setState({ goldValue: change });

	},
	onFocus: function (e) {
		this.refs.input.select();
	},
	onKeyPress: function (e) {
		if (e.key === 'Enter') {
			this.setState({ text: null })
		}
	},
	onHide: function (e) {
		this.setState({
			editing: false,
			showModal: false
		});
	},
	onMinus: function (e) {

		this.props.onUpdate(this.props.id, +this.props.data - +this.state.text);

	},
	onPlus: function (e) {

		this.props.onUpdate(this.props.id, +this.props.data + +this.state.text);

	},
	close() {
		this.setState({ editing: false, showModal: false });
	},

	open() {
		this.setState({ editing: true, showModal: true });
	},
	render: function () {

		if (this.state.editing) {
			var cssClasses = this.props.className;

			var diceValueNodes = []

			for (var i = 1; i <= 20; i++) {
				diceValueNodes.push(<option value={i}>{i}</option>);
			}

			var goldValueNodes = []

			for (var i = 0; i <= 100; i += 5) {
				goldValueNodes.push(<option value={i}>{i}</option>);
			}

			return (
				<div>
					<div id={this.props.id} className={this.props.className}>
						{this.props.data}
					</div>

					<div className="modalbox">
						<div id="modalbox" className="text editLargeModal">
							<span style={{ fontSize: "150%", width: '100%', height: "200px" }}>Current {this.props.id}: {this.props.data}</span>
							<br />
							<div style={{ width: '100%', height: "125px", marginTop: "40px" }}>
								<div style={{ fontSize: "75%", width: '60%', margin: "auto" }}>
									<span>Enter the amount of {this.props.id} to add or subtract.</span>
									<input type="number" value={this.state.text} onChange={this.onChange} onKeyPress={this.onKeyPress} maxLength={this.props.maxLength} ref="input" style={{ fontSize: "125%", width: '100%' }} placeholder="0" />

									<button type="button" className="btn btn-danger btn-number" data-type="minus" onClick={this.onMinus} style={{ fontSize: "125%", width: '50%', height: "80px" }}>
										<span className="glyphicon glyphicon-minus">-</span>
									</button>
									<button type="button" className="btn btn-success btn-number" data-type="plus" onClick={this.onPlus} style={{ fontSize: "125%", width: '50%', height: "80px" }}>
										<span className="glyphicon glyphicon-plus">+</span>
									</button>
								</div>
							</div>
							<br />
							<div style={{ width: '100%', height: "75px", marginTop: "20px" }}>
								<div style={{ fontSize: "75%", width: '100%', verticalAlign: "center" }}>
									Gold calculator:<br />
									<span>Dice: </span>
									<select value={this.state.diceValue} onChange={this.onDiceChange} style={{ fontSize: "100%" }}>
										{diceValueNodes}
									</select>
									<span>  *  </span>
									<span>Gold: </span>
									<select value={this.state.goldValue} onChange={this.onGoldChange} style={{ fontSize: "100%" }}>
										{goldValueNodes}
									</select>
									<span>  =  </span>
									<button type="button" className="btn btn-success btn-number" onClick={this.calculate} style={{ fontSize: "90%", marginTop: "0px" }}>
										<span>Calculate</span>
									</button>
								</div>

							</div>
						</div>
					</div>
				</div>
			)
		}
		else {
			return (
				<div id={this.props.id} className={this.props.className} onClick={this.onClick}>
					{this.props.data}
				</div>
			);
		}
	}
});

var EditXpModal = React.createClass({
	getInitialState: function () {
		return {
			editing: false,
			text: null,
			showModal: false,
			baseValue: 0,
			hitValue: 5,
			hitCount: 1,
		};
	},
	componentDidMount: function () {
		window.addEventListener('mousedown', this.pageClick, false);
	},
	calculate: function () {

		var calc = +this.state.baseValue + (+this.state.hitValue * +this.state.hitCount);

		if (calc > 0) {
			this.setState({ text: calc });
		}

	},
	pageClick: function (e) {
		if ($(event.target).closest('#modalbox').length) {
			return;
		}

		this.setState({
			editing: false,
			text: null,
			showModal: false
		});
	},
	onClick: function (e) {

		this.setState({
			editing: true,
			showModal: true
		});
	},
	onChange: function (e) {
		const change = e.target.value;
		this.setState({ text: change });
	},
	onBaseChange: function (e) {
		const change = e.target.value;
		this.setState({ baseValue: change });
	},
	onHitValueChange: function (e) {
		const change = e.target.value;
		this.setState({ hitValue: change });
	},
	onHitCountChange: function (e) {
		const change = e.target.value;
		this.setState({ hitCount: change });
	},
	onFocus: function (e) {
		this.refs.input.select();
	},
	onKeyPress: function (e) {
		if (e.key === 'Enter') {
			this.setState({ text: null })
		}
	},
	onHide: function (e) {
		this.setState({
			editing: false,
			showModal: false
		});
	},
	onMinus: function (e) {

		this.props.onUpdate(this.props.id, +this.props.data - +this.state.text);

	},
	onPlus: function (e) {

		this.props.onUpdate(this.props.id, +this.props.data + +this.state.text);

	},
	close() {
		this.setState({ editing: false, showModal: false });
	},

	open() {
		this.setState({ editing: true, showModal: true });
	},
	render: function () {

		if (this.state.editing) {
			var cssClasses = this.props.className;

			var baseValueNodes = []

			for (var i = 0; i <= 100; i += 5) {
				baseValueNodes.push(<option value={i}>{i}</option>);
			}

			var hitValueNodes = []

			for (var i = 5; i <= 100; i += 5) {
				hitValueNodes.push(<option value={i}>{i}</option>);
			}

			var hitCountNodes = []

			for (var i = 1; i <= 30; i++) {
				hitCountNodes.push(<option value={i}>{i}</option>);
			}

			return (
				<div>
					<div id={this.props.id} className={this.props.className}>
						{this.props.data}
					</div>

					<div className="modalbox">
						<div id="modalbox" className="text editLargeModal">
							<span style={{ fontSize: "150%", width: '100%', height: "200px" }}>Current {this.props.id}: {this.props.data}</span>
							<br />
							<div style={{ width: '100%', height: "125px", marginTop: "40px" }}>
								<div style={{ width: '60%', fontSize: "80%", margin: "auto" }}>
									<span>Enter the amount of {this.props.id} to add or subtract.</span>
									<input type="number" value={this.state.text} onChange={this.onChange} onKeyPress={this.onKeyPress} maxLength={this.props.maxLength} ref="input" style={{ width: '100%' }} placeholder="0" />

									<button type="button" className="btn btn-danger btn-number" data-type="minus" onClick={this.onMinus} style={{ fontSize: "150%", width: '50%', height: "80px" }}>
										<span className="glyphicon glyphicon-minus">-</span>
									</button>
									<button type="button" className="btn btn-success btn-number" data-type="plus" onClick={this.onPlus} style={{ fontSize: "150%", width: '50%', height: "80px" }}>
										<span className="glyphicon glyphicon-plus">+</span>
									</button>
								</div>
							</div>
							<br />
							<div style={{ width: '100%', height: "75px", marginTop: "20px" }}>
								<div style={{ width: '100%', fontSize: "75%", verticalAlign: "center" }}>
									<span>XP calculator:</span><br />
									<span>Base: </span>
									<select value={this.state.baseValue} onChange={this.onBaseChange}>
										{baseValueNodes}
									</select>
									<span>  +  </span>
									<span>(Per Hit: </span>
									<select value={this.state.hitValue} onChange={this.onHitValueChange}>
										{hitValueNodes}
									</select>
									<span>  *  </span>
									<span>Hits: </span>
									<select value={this.state.hitCount} onChange={this.onHitCountChange}>
										{hitCountNodes}
									</select>
									<span>)  =  </span>

									<button type="button" className="btn btn-success btn-number" onClick={this.calculate} style={{ fontSize: "90%", marginTop: "0px" }}>
										<span>Calculate</span>
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			)
		}
		else {
			return (
				<div id={this.props.id} className={this.props.className} onClick={this.onClick}>
					{this.props.data}
				</div>
			);
		}
	}
});

var EditStatsModal = React.createClass({
	getInitialState: function () {
		return {
			editing: false,
			text: null,
			showModal: false
		};
	},
	componentDidMount: function () {
		window.addEventListener('mousedown', this.pageClick, false);
	},
	pageClick: function (e) {
		if ($(event.target).closest('#modalbox').length) {
			return;
		}

		this.setState({
			editing: false,
			text: null,
			showModal: false
		});
	},
	onClick: function (e) {

		this.setState({
			editing: true,
			showModal: true
		});
	},
	onHide: function (e) {
		this.setState({
			editing: false,
			showModal: false
		});
	},
	onMinus: function (e) {

		this.props.onUpdate(this.props.id, +this.props.data - +e);

	},
	onPlus: function (e) {

		this.props.onUpdate(this.props.id, +this.props.data + +e);

	},
	close() {
		this.setState({ editing: false, showModal: false });
	},

	open() {
		this.setState({ editing: true, showModal: true });
	},
	render: function () {

		if (this.state.editing) {
			var cssClasses = this.props.className;

			var statBonus = this.props.bonus;

			if (+statBonus > 0) {
				var formattedStat = <span className={this.props.plus} style={{ color: "green" }}>{+this.props.data + +statBonus}</span>
			}
			else if (+statBonus < 0) {
				var formattedStat = <span className={this.props.plus} style={{ color: "red" }}>{+this.props.data + +statBonus}</span>
			}
			else {
				var formattedStat = <span className={this.props.plus}>{this.props.data}</span>
			}

			return (
				<div>
					<div id={this.props.id} className={this.props.className}>
						{formattedStat}
					</div>

					<div className="modalbox">
						<div id="modalbox" className="text editLargeModal" style={{ height: "400px" }}>
							<span style={{ fontSize: "150%", width: '100%', height: "150px" }}>Current {this.props.id}: {this.props.data}</span><br /><br />

							<div style={{ width: '100%', height: "200px" }}>

								<span>Select a value to change your {this.props.id}.</span>
								<div className="register-btn-group">
									<div className="registerkey">
										<button type="button" className="btn redkey" data-type="minus" value="5" onClick={() => this.onMinus(5)}>
											<span className="glyphicon glyphicon-minus rockwell">-5</span>
										</button>
									</div>
									<div className="registerkey">
										<button type="button" className="btn redkey" data-type="minus" value="3" onClick={() => this.onMinus(3)}>
											<span className="glyphicon glyphicon-minus rockwell">-3</span>
										</button>
									</div>
									<div className="registerkey">
										<button type="button" className="btn redkey" data-type="minus" value="1" onClick={() => this.onMinus(1)}>
											<span className="glyphicon glyphicon-minus rockwell">-1</span>
										</button>
									</div>
									<div className="registerkey">
										<button type="button" className="btn blackkey" data-type="plus" value="1" onClick={() => this.onPlus(1)}>
											<span className="glyphicon glyphicon-plus rockwell">+1</span>
										</button>
									</div>
									<div className="registerkey">
										<button type="button" className="btn blackkey" data-type="plus" value="3" onClick={() => this.onPlus(3)}>
											<span className="glyphicon glyphicon-plus rockwell">+3</span>
										</button>
									</div>
									<div className="registerkey">
										<button type="button" className="btn blackkey" data-type="plus" value="5" onClick={() => this.onPlus(5)}>
											<span className="glyphicon glyphicon-plus rockwell">+5</span>
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)
		}
		else {

			var statBonus = this.props.bonus;

			if (+statBonus > 0) {
				var formattedStat = <span className={this.props.plus} style={{ color: "green" }}>{+this.props.data + +statBonus}</span>
			}
			else if (+statBonus < 0) {
				var formattedStat = <span className={this.props.plus} style={{ color: "red" }}>{+this.props.data + +statBonus}</span>
			}
			else {
				var formattedStat = <span className={this.props.plus}>{this.props.data}</span>
			}

			return (
				<div id={this.props.id} className={this.props.className} onClick={this.onClick}>
					{formattedStat}
				</div>
			);
		}
	}
});

var EditSideBagModal = React.createClass({
	getInitialState: function () {
		return {
			editing: false,
			text: null,
			showModal: false
		};
	},
	componentDidMount: function () {
		window.addEventListener('mousedown', this.pageClick, false);
	},
	pageClick: function (e) {
		if ($(event.target).closest('#modalbox').length) {
			return;
		}
		this.setState({
			editing: false,
			text: null,
			showModal: false
		});
	},
	onClick: function (e) {

		this.setState({
			editing: true,
			showModal: true
		});
	},
	onHide: function (e) {
		this.setState({
			editing: false,
			showModal: false
		});
	},
	onMinus: function (e) {

		this.props.onUpdate(this.props.id, +this.props.data - +e);

	},
	onPlus: function (e) {

		this.props.onUpdate(this.props.id, +this.props.data + +e);

	},
	close() {
		this.setState({ editing: false, showModal: false });
	},

	open() {
		this.setState({ editing: true, showModal: true });
	},
	render: function () {

		if (this.state.editing) {
			var cssClasses = this.props.className;


			return (
				<div>
					<div id={this.props.id} className={this.props.className}>
						<span className={this.props.plus}>{this.props.data}</span>
					</div>

					<div className="modalbox">
						<div id="modalbox" className="text editLargeModal" style={{ height: "400px" }}>
							<span style={{ fontSize: "150%", width: '100%', height: "150px" }}>Current {this.props.id}: {this.props.data}</span><br /><br />

							<div style={{ width: '100%', height: "200px" }}>

								<span>Select a value to change your {this.props.id}.</span>
								<div className="register-btn-group">
									<div className="registerkey">
										<button type="button" className="btn redkey" data-type="minus" value="5" onClick={() => this.onMinus(5)}>
											<span className="glyphicon glyphicon-minus rockwell">-5</span>
										</button>
									</div>
									<div className="registerkey">
										<button type="button" className="btn redkey" data-type="minus" value="3" onClick={() => this.onMinus(3)}>
											<span className="glyphicon glyphicon-minus rockwell">-3</span>
										</button>
									</div>
									<div className="registerkey">
										<button type="button" className="btn redkey" data-type="minus" value="1" onClick={() => this.onMinus(1)}>
											<span className="glyphicon glyphicon-minus rockwell">-1</span>
										</button>
									</div>
									<div className="registerkey">
										<button type="button" className="btn blackkey" data-type="plus" value="1" onClick={() => this.onPlus(1)}>
											<span className="glyphicon glyphicon-plus rockwell">+1</span>
										</button>
									</div>
									<div className="registerkey">
										<button type="button" className="btn blackkey" data-type="plus" value="3" onClick={() => this.onPlus(3)}>
											<span className="glyphicon glyphicon-plus rockwell">+3</span>
										</button>
									</div>
									<div className="registerkey">
										<button type="button" className="btn blackkey" data-type="plus" value="5" onClick={() => this.onPlus(5)}>
											<span className="glyphicon glyphicon-plus rockwell">+5</span>
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)
		}
		else {
			return (
				<div id={this.props.id} className={this.props.className} onClick={this.onClick}>
					<span className={this.props.plus}>{this.props.data}</span>
				</div>
			);
		}
	}
});

var ItemsAbilitysInjuries = React.createClass({
	render: function () {
		return (
			<div className="itemsAbilitysInjuries">
				<div onClick={() => this.props.onActivePanelUpdate("items")}>

				</div>
				<div onClick={() => this.props.onActivePanelUpdate("abilities")}>

				</div>
				<div onClick={() => this.props.onActivePanelUpdate("injuries")}>

				</div>
			</div>
		);
	}
});

var ItemsPanel = React.createClass({
	getInitialState: function () {
		return {
			adding: false,
			editing: false,
			editId: null
		};
	},
	componentDidMount: function () {

	},


	onAdd: function (e) {
		this.setState({ adding: true });

	},
	onEdit: function (id) {

		this.setState({
			editing: true,
			editId: id
		});

	},
	onItemAdded: function (e) {
		var items = this.props.data;

		items.push(e);

		this.setState({ adding: false });

		this.props.onUpdate(items);

	},
	onItemDeleted: function (e) {
		var items = this.props.data;

		for (var i in items) {
			if (items[i].id == e.id) {
				if (i > -1) {
					items.splice(i, 1);
				}
				break; //Stop this loop, we found it!
			}
		}

		this.setState({
			editId: null,
			editing: false
		});

		this.props.onUpdate(items);

	},
	onItemEdited: function (e) {
		var items = this.props.data;

		for (var i in items) {
			if (items[i].id == e.id) {
				items[i] = e;
				break; //Stop this loop, we found it!
			}
		}

		this.setState({
			editId: null,
			editing: false
		});

		this.props.onUpdate(items);

	},
	onModalClose: function () {
		this.setState({
			editId: null,
			adding: false,
			editing: false
		});
	},
	render: function () {

		if (this.state.adding) {
			var itemModal = <ItemsModal onUpdate={(item) => this.onItemAdded(item)} onClose={this.onModalClose} />;
		}
		else if (this.state.editing) {
			var itemModal = <div />;

			var item = this.props.data.find(x => x.id == this.state.editId);

			if (item !== null) {
				itemModal = <ItemsModal onUpdate={(item) => this.onItemEdited(item)} onDelete={(item) => this.onItemDeleted(item)} onClose={this.onModalClose} data={item} />;
			}

		}

		return (
			<div style={{ visibility: this.props.activePanel === "items" ? "" : "hidden" }}>
				<div id={this.props.id} className={this.props.className} >
					<img src={'img/item_icons.png'} className="itemsIcons" />

					<button type="button" className="btn btn-success addButton" onClick={this.onAdd}>
						<span style={{ fontFamily: "rockwell-condensed-bold" }}>+Add Item</span>
					</button>
					<div style={{ marginTop: "5px" }}>
						<span style={{ position: "absolute", left: "180px" }}># - Name - Bonuses - Abilities</span>
						<span style={{ position: "absolute", left: "730px" }}>Equipped</span>
						<span style={{ position: "absolute", left: "808px" }}>Edit</span>
					</div>

					<div>
						<ItemRows data={this.props.data} itemEdit={this.onEdit} />
					</div>
				</div>

				{itemModal}
			</div>
		)
	}
});

var ItemRows = React.createClass({
	getInitialState: function () {
		return {
		};
	},
	componentDidMount: function () {

	},

	onEdit: function (id) {
		this.props.itemEdit(id);
	},

	render: function () {
		if (this.props.data !== null) {
			var items = this.props.data.map((item) => (
				<tr className="itemRow noShadow" style={{ verticalAlign: "top", opacity: item.equipped === true ? "1" : ".35" }}>
					<td style={{ textAlign: "center", width: "23px" }}>
						<span>{item.baseStats.anvil==0 ? "": item.baseStats.anvil}</span>
					</td>
					<td style={{ textAlign: "center", width: "28px" }}>
						<span>{item.baseStats.darkstone==0 ? "": item.baseStats.darkstone}</span>
					</td>
					<td style={{ textAlign: "center", width: "25px" }}>
						<span>{item.baseStats.hands==0 ? "": item.baseStats.hands}</span>
					</td>
					<td style={{ textAlign: "center", width: "38px" }}>
					<span>{item.baseStats.slots==0 ? "": item.baseStats.slots}</span>
					</td>
					<td style={{ textAlign: "left", width: "50px" }}>
						<span>{item.baseStats.value==0 ? "": "$"+item.baseStats.value}</span>
					</td>
					<td style={{ textAlign: "center", width: "28px" }}>
						<span>{item.baseStats.count==0 ? "-": item.baseStats.count}</span>
					</td>
					<td style={{ textAlign: "left", width: "542px" }}>
						<ItemDescription data={item} />
					</td>
					<td style={{ textAlign: "center", width: "63px" }}>
						<span>{item.equipped === true ? "Yes" : "No"}</span>
					</td>
					<td style={{ textAlign: "center", width: "50px" }}>
						<span className="glyphicon glyphicon-pencil gi-1x glyphibutton" style={{ marginTop: "3px" }} onClick={() => this.onEdit(item.id)}>X</span>
					</td>
				</tr>
			));

			return (
				<div className="itemRows">
					<table style={{ verticalAlign: "top" }}>
						{items}
					</table>
				</div>
			);
		}
	}
});

var ItemsModal = React.createClass({
	getInitialState: function () {
		return {
			id: this.getGuid(),
			name: "",
			abilities: [],
			anvil: 0,
			darkstone: 0,
			slots: 0,
			hands: 0,
			count: 1,
			value: 0,
			extendedStats: {},
			agility: 0,
			cunning: 0,
			spirit: 0,
			strength: 0,
			lore: 0,
			luck: 0,
			initiative: 0,
			combat: 0,
			melee: 0,
			range: 0,
			defense: 0,
			willpower: 0,
			maxHealth: 0,
			maxSanity: 0,
			maxGrit: 0,
			equipped: true,
			editing: false,
			abilityInput: "",
			editingAbility: false,
			activePanel: "stats",
			abilityBeingEdited: ""
		};
	},

	componentDidMount: function () {
		if (this.props.data != null) {
			this.setState({
				id: this.props.data.id,
				name: this.props.data.name,
				abilities: this.props.data.abilities,
				anvil: this.props.data.baseStats.anvil,
				darkstone: this.props.data.baseStats.darkstone,
				slots: this.props.data.baseStats.slots,
				hands: this.props.data.baseStats.hands,
				count: this.props.data.baseStats.count,
				value: this.props.data.baseStats.value,
				extendedStats: this.props.data.extendedStats,
				agility: this.props.data.bonus.agility,
				cunning: this.props.data.bonus.cunning,
				spirit: this.props.data.bonus.spirit,
				strength: this.props.data.bonus.strength,
				lore: this.props.data.bonus.lore,
				luck: this.props.data.bonus.luck,
				initiative: this.props.data.bonus.initiative,
				combat: this.props.data.bonus.combat,
				melee: this.props.data.bonus.melee,
				range: this.props.data.bonus.range,
				defense: this.props.data.bonus.defense,
				willpower: this.props.data.bonus.willpower,
				maxHealth: this.props.data.bonus.maxHealth,
				maxSanity: this.props.data.bonus.maxSanity,
				maxGrit: this.props.data.bonus.maxGrit,
				equipped: this.props.data.equipped,
				editing: true
			});
		}

	},

	addAbility: function () {

		if (this.state.abilityInput.length > 0) {
			var abilities = this.state.abilities;

			abilities.push(this.state.abilityInput);

			this.setState({
				abilities: abilities,
				abilityInput: ""
			});
		}

	},

	editAbility: function () {

		if (this.state.abilityInput.length > 0) {
			var abilities = this.state.abilities;

			var index = abilities.indexOf(this.state.abilityBeingEdited);

			abilities[index] = this.state.abilityInput;

			this.setState({
				abilities: abilities,
				abilityInput: "",
				abilityBeingEdited: "",
				editingAbility: false
			});
		}
		else {
			var abilities = this.state.abilities;

			var index = abilities.indexOf(this.state.abilityBeingEdited);

			if (index > -1) {
				abilities.splice(index, 1);
			}

			this.setState({
				abilities: abilities,
				abilityInput: "",
				abilityBeingEdited: "",
				editingAbility: false
			});
		}

	},

	onCancel: function (e) {
		this.props.onClose();
	},

	getGuid: function guid() {
		var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
			return v.toString(16);
		});

		return (
			guid
		);
	},

	onSave: function () {
		if (this.state.name.length > 0) {
			var item = {
				id: this.state.id,
				name: this.state.name,
				abilities: this.state.abilities,
				baseStats: { anvil: this.state.anvil, darkstone: this.state.darkstone, slots: this.state.slots, hands: this.state.hands, value: this.state.value, count: this.state.count },
				extendedStats: this.state.extendedStats,
				bonus: { agility: this.state.agility, cunning: this.state.cunning, spirit: this.state.spirit, strength: this.state.strength, lore: this.state.lore, luck: this.state.luck, initiative: this.state.initiative, combat: this.state.combat, melee: this.state.melee, range: this.state.range, defense: this.state.defense, willpower: this.state.willpower, maxHealth: this.state.maxHealth, maxSanity: this.state.maxSanity, maxGrit: this.state.maxGrit },
				equipped: this.state.equipped
			};

			this.props.onUpdate(item);
		}

	},

	onDelete: function () {
		this.props.onDelete(this.props.data);
	},

	selectValues: function (min, max, inc) {
		var values = [];

		for (var i = min; i <= max; i += inc) {
			values.push(<option value={i}>{i}</option>);
		}

		return (
			values
		);
	},

	onClickAbility: function (e) {
		var ability = e.target.innerHTML;

		this.setState({
			abilityInput: ability,
			editingAbility: true,
			abilityBeingEdited: ability
		});
	},

	onEditAbilityCancel: function () {
		this.setState({
			abilityInput: "",
			editingAbility: false,
			abilityBeingEdited: ""
		});
	},

	render: function () {

		if (this.state.editing) {
			var title = "Editing: " + String(this.props.data.name);
		}
		else {
			var title = "Add a New Item";
		}

		return (
			<div className="modalbox nopointer">
				<div id="modalbox" className="text editWideModal nopointer" style={{ height: "450px" }}>
					<span style={{ fontSize: "125%", width: '100%', height: "100px" }}>{title}</span>
					<br />
					<div>
						<div className="itemModalName">
							<span>Name: </span>
							<input type="text" value={this.state.name} onChange={(e) => this.setState({ name: e.target.value })} style={{ fontSize: "24", width: "250px", height: "35px" }} />
							&nbsp;&nbsp;
								  <span>Equipped: </span>
							<input type="checkbox" checked={this.state.equipped} onChange={(e) => this.setState({ equipped: e.target.checked })} style={{ width: "35px", height: "35px" }} />
							<div style={{ float: "right" }}>
								<button type="button" className="btn btn-success" onClick={this.onSave} disabled={false}>
									<span style={{ fontFamily: "rockwell-condensed-bold", fontSize: "175%" }}> Save </span>
								</button>
								&nbsp;&nbsp;
									<button type="button" className="btn btn-danger " onClick={this.onCancel}>
									<span style={{ fontFamily: "rockwell-condensed-bold", fontSize: "175%" }}>Cancel</span>
								</button>
							</div>
						</div>
						<div className="itemModalTabPanel">
							<div className="tabControl" onClick={() => this.setState({ activePanel: "stats" })} style={{ backgroundColor: this.state.activePanel === "stats" ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.0)" }}>
								Stats
								</div>
							<div className="tabControl" onClick={() => this.setState({ activePanel: "bonuses" })} style={{ backgroundColor: this.state.activePanel === "bonuses" ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.0)" }}>
								Bonuses
								</div>
							<div className="tabControl" onClick={() => this.setState({ activePanel: "abilities" })} style={{ backgroundColor: this.state.activePanel === "abilities" ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.0)" }}>
								Abilities
								</div>
							{
								this.state.editing == true ?
									<div className="tabControl" onClick={() => this.setState({ activePanel: "delete" })} style={{ backgroundColor: this.state.activePanel === "delete" ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.0)" }}>
										Delete
										</div>
									:
									<div />
							}
						</div>
						<div className="itemModalStatsPanel" style={{ visibility: this.state.activePanel === "stats" ? "visible" : "hidden" }}>
							<span>Anvils: </span>
							<select value={this.state.anvil} onChange={(e) => this.setState({ anvil: e.target.value })} >
								{this.selectValues(0, 9, 1)}
							</select>
							<br />
							<div />

							<span>Darkstone: </span>
							<select value={this.state.darkstone} onChange={(e) => this.setState({ darkstone: e.target.value })} >
								{this.selectValues(0, 9, 1)}
							</select>
							<br />
							<div />

							<span>Hands: </span>
							<select value={this.state.hands} onChange={(e) => this.setState({ hands: e.target.value })} >
								{this.selectValues(0, 2, 1)}
							</select>
							<br />
							<div />

							<span>Upgrade Slots: </span>
							<select value={this.state.slots} onChange={(e) => this.setState({ slots: e.target.value })} >
								{this.selectValues(0, 9, 1)}
							</select>
							<br />
							<div />

							<span>Value: </span>
							<input type="number" value={this.state.value} onChange={(e) => this.setState({ value: e.target.value })} />
							<br />
							<span>Count: </span>
							<input type="number" value={this.state.count} onChange={(e) => this.setState({ count: e.target.value })} />
							<br />


						</div>

						<div className="itemModalBonusesPanel" style={{ visibility: this.state.activePanel === "bonuses" ? "visible" : "hidden" }}>
							<div>
								<span>Agility: </span>
								<select value={this.state.agility} onChange={(e) => this.setState({ agility: e.target.value })}>
									{this.selectValues(-10, 10, 1)}
								</select>
								<br />

								<span>Cunning: </span>
								<select value={this.state.cunning} onChange={(e) => this.setState({ cunning: e.target.value })}>
									{this.selectValues(-10, 10, 1)}
								</select>
								<br />

								<span>Spirit: </span>
								<select value={this.state.spirit} onChange={(e) => this.setState({ spirit: e.target.value })}>
									{this.selectValues(-10, 10, 1)}
								</select>
								<br />

								<span>Strength: </span>
								<select value={this.state.strength} onChange={(e) => this.setState({ strength: e.target.value })}>
									{this.selectValues(-10, 10, 1)}
								</select>
								<br />

								<span>Lore: </span>
								<select value={this.state.lore} onChange={(e) => this.setState({ lore: e.target.value })}>
									{this.selectValues(-10, 10, 1)}
								</select>
							</div>

							<div>
								<span>Luck: </span>
								<select value={this.state.luck} onChange={(e) => this.setState({ luck: e.target.value })}>
									{this.selectValues(-10, 10, 1)}
								</select>
								<br />

								<span>Initiative: </span>
								<select value={this.state.initiative} onChange={(e) => this.setState({ initiative: e.target.value })}>
									{this.selectValues(-10, 10, 1)}
								</select>
								<br />

								<span>Combat: </span>
								<select value={this.state.combat} onChange={(e) => this.setState({ combat: e.target.value })}>
									{this.selectValues(-10, 10, 1)}
								</select>
								<br />

								<span>Melee: </span>
								<select value={this.state.melee} onChange={(e) => this.setState({ melee: e.target.value })}>
									{this.selectValues(-10, 10, 1)}
								</select>
								<br />

								<span>Range: </span>
								<select value={this.state.range} onChange={(e) => this.setState({ range: e.target.value })}>
									{this.selectValues(-10, 10, 1)}
								</select>
							</div>

							<div>
								<span>Defense: </span>
								<select value={this.state.defense} onChange={(e) => this.setState({ defense: e.target.value })}>
									{this.selectValues(-10, 10, 1)}
								</select>
								<br />

								<span>Willpower: </span>
								<select value={this.state.willpower} onChange={(e) => this.setState({ willpower: e.target.value })}>
									{this.selectValues(-10, 10, 1)}
								</select>
								<br />

								<span>Max Health: </span>
								<select value={this.state.maxHealth} onChange={(e) => this.setState({ maxHealth: e.target.value })}>
									{this.selectValues(-10, 10, 1)}
								</select>
								<br />

								<span>Max Sanity: </span>
								<select value={this.state.maxSanity} onChange={(e) => this.setState({ maxSanity: e.target.value })}>
									{this.selectValues(-10, 10, 1)}
								</select>
								<br />

								<span>Max Grit: </span>
								<select value={this.state.maxGrit} onChange={(e) => this.setState({ maxGrit: e.target.value })}>
									{this.selectValues(-10, 10, 1)}
								</select>
							</div>

						</div>

						<div className="itemModalAbilitiesPanel" style={{ visibility: this.state.activePanel === "abilities" ? "visible" : "hidden" }}>
							<input type="text" value={this.state.abilityInput} onChange={(e) => this.setState({ abilityInput: e.target.value })} placeholder={this.state.editingAbility === true ? "" : "Add Ability..."} />

							<button type="button" className="btn btn-success" onClick={this.state.editingAbility === true ? this.editAbility : this.addAbility} style={{ height: "35px", marginLeft: "10px" }}>
								<span className="rockwell" style={{ fontSize: "150%" }}> {this.state.editingAbility === true ? "Save Edit" : "Add Ability"} </span>
							</button>

							{ //Add in a cancel button when editing an ability
								this.state.editingAbility === true ?

									<button type="button" className="btn btn-danger" onClick={this.onEditAbilityCancel} style={{ height: "35px", marginLeft: "5px" }}>
										<span className="rockwell" style={{ fontSize: "150%", marginTop: "-5px" }}> Cancel </span>
									</button>

									: ""
							}

							<div className="itemAbilityListForClick">
								<ul>
									{
										this.state.abilities.map((ability) => {
											return (
												<li onClick={this.onClickAbility}>{ability}</li>
											);

										})
									}
								</ul>
							</div>
						</div>
						<div className="itemModalDeletePanel" style={{ visibility: this.state.activePanel === "delete" ? "visible" : "hidden" }}>
							<span> WARNING:  This item will be deleted! </span>
							<button type="button" className="btn btn-danger " onClick={this.onDelete}>
								<span className="rockwell">Delete {this.state.editing === true ? this.props.data.name : ""}</span>
							</button>
						</div>
					</div>
					<br />
				</div>
			</div>
		);

	}
});

var ItemDescription = React.createClass({
	getInitialState: function () {
		return {
		};
	},

	render: function () {
		return (
			<div style={{ width: '100%', textAlign: "left" }}>
				<ItemDescriptionNameAndBonus data={this.props.data} />
				<ItemDescriptionAbilties data={this.props.data} />
				<ItemDescriptionExtendedStats data={this.props.data} />
			</div>
		);
	}
});

var ItemDescriptionNameAndBonus = React.createClass({
	getInitialState: function () {
		return {
		};
	},
	componentDidMount: function () {

	},

	render: function () {
		var item = this.props.data;
		var bonus = item.bonus;
		var bonuses = [];

		if (item.bonus != null) {
			bonuses.push("(");

			for (var stat in item.bonus) {
				if (bonus[stat] < 0) {
					bonuses.push(<span style={{ color: "red" }}>{bonus[stat] + " " + stat}</span>);
					bonuses.push(", ");
				}
				else if (bonus[stat] > 0) {
					bonuses.push(<span style={{ color: "green" }}>{"+" + bonus[stat] + " " + stat}</span>);
					bonuses.push(", ");
				}


			}

			bonuses.pop(); //Get rid of the last comma 
			bonuses.push(")");

			if (bonuses.length <= 2) { bonuses = [] }
		}

		return (
			<div style={{ width: '100%', textAlign: "left" }}>
				{item.name} <span className="smallFont" style={{ fontStyle: "italic", fontWeight: "100" }}> {bonuses} </span>
			</div>
		);



	}
});

var ItemDescriptionAbilties = React.createClass({
	getInitialState: function () {
		return {

		};
	},
	componentDidMount: function () {

	},

	render: function () {

		var item = this.props.data;

		if (item.abilities.length > 0) {
			var abilities = item.abilities.map((ability) => (
				<li>
					{ability}
				</li>
			));

			return (
				<div className="smallFont" style={{ width: '100%', textAlign: "left" }}>
					<ul>
						{abilities}
					</ul>
				</div>
			);
		}
		else {
			return (
				<div style={{ width: '100%', textAlign: "left" }}>

				</div>
			);
		}


	}
});

var ItemDescriptionExtendedStats = React.createClass({
	getInitialState: function () {
		return {

		};
	},
	componentDidMount: function () {

	},

	render: function () {

		var item = this.props.data;


		if (item.extendedStats.length > 0) {
			var extendedStats = "";

			return (
				<div style={{ width: '100%', textAlign: "left" }}>
					<br />
					{extendedStats}
				</div>
			);
		}
		else {
			return (
				<div style={{ width: '100%', textAlign: "left" }}>

				</div>
			);
		}
	}
});

var AbilitiesPanel = React.createClass({
	getInitialState: function () {
		return {
			adding: false,
			editing: false,
			editId: null
		};
	},
	componentDidMount: function () {

	},


	onAdd: function (e) {

		this.setState({ adding: true });
	},
	onEdit: function (id) {

		this.setState({
			editing: true,
			editId: id
		});

	},
	onItemAdded: function (e) {
		var items = this.props.data;

		items.push(e);

		this.setState({ adding: false });

		this.props.onUpdate(items);

	},
	onItemDeleted: function (e) {
		var items = this.props.data;

		for (var i in items) {
			if (items[i].id == e.id) {
				if (i > -1) {
					items.splice(i, 1);
				}
				break; //Stop this loop, we found it!
			}
		}

		this.setState({
			editId: null,
			editing: false
		});

		this.props.onUpdate(items);

	},
	onItemEdited: function (e) {
		var items = this.props.data;

		for (var i in items) {
			if (items[i].id == e.id) {
				items[i] = e;
				break; //Stop this loop, we found it!
			}
		}

		this.setState({
			editId: null,
			editing: false
		});

		this.props.onUpdate(items);

	},
	onModalClose: function () {
		this.setState({
			editId: null,
			adding: false,
			editing: false
		});
	},
	render: function () {

		if (this.state.adding) {
			var itemModal = <ItemsModal onUpdate={(item) => this.onItemAdded(item)} onClose={this.onModalClose} />;
		}
		else if (this.state.editing) {
			var itemModal = <div />;

			var item = this.props.data.find(x => x.id == this.state.editId);

			if (item !== null) {
				itemModal = <ItemsModal onUpdate={(item) => this.onItemEdited(item)} onDelete={(item) => this.onItemDeleted(item)} onClose={this.onModalClose} data={item} />;
			}

		}

		return (
			<div style={{ visibility: this.props.activePanel === "abilities" ? "" : "hidden" }}>
				<div id={this.props.id} className={this.props.className} >

					<span>Abilities Coming Soon!</span>

				</div>

			</div>
		)
	}
});

var InjuriesPanel = React.createClass({
	getInitialState: function () {
		return {
			adding: false,
			editing: false,
			editId: null
		};
	},
	componentDidMount: function () {

	},


	onAdd: function (e) {
		this.setState({ adding: true });

	},
	onEdit: function (id) {

		this.setState({
			editing: true,
			editId: id
		});

	},
	onItemAdded: function (e) {
		var items = this.props.data;

		items.push(e);

		this.setState({ adding: false });

		this.props.onUpdate(items);

	},
	onItemDeleted: function (e) {
		var items = this.props.data;

		for (var i in items) {
			if (items[i].id == e.id) {
				if (i > -1) {
					items.splice(i, 1);
				}
				break; //Stop this loop, we found it!
			}
		}

		this.setState({
			editId: null,
			editing: false
		});

		this.props.onUpdate(items);

	},
	onItemEdited: function (e) {
		var items = this.props.data;

		for (var i in items) {
			if (items[i].id == e.id) {
				items[i] = e;
				break; //Stop this loop, we found it!
			}
		}

		this.setState({
			editId: null,
			editing: false
		});

		this.props.onUpdate(items);

	},
	onModalClose: function () {
		this.setState({
			editId: null,
			adding: false,
			editing: false
		});
	},
	render: function () {

		if (this.state.adding) {
			var itemModal = <ItemsModal onUpdate={(item) => this.onItemAdded(item)} onClose={this.onModalClose} />;
		}
		else if (this.state.editing) {
			var itemModal = <div />;

			var item = this.props.data.find(x => x.id == this.state.editId);

			if (item !== null) {
				itemModal = <ItemsModal onUpdate={(item) => this.onItemEdited(item)} onDelete={(item) => this.onItemDeleted(item)} onClose={this.onModalClose} data={item} />;
			}

		}

		return (
			<div style={{ visibility: this.props.activePanel === "injuries" ? "" : "hidden" }}>
				<div id={this.props.id} className={this.props.className}>

					<span>Injuries Coming Soon!</span>

				</div>

			</div>
		)
	}
});

ReactDOM.render(<CharacterSheet />,
	document.getElementById('content')
);