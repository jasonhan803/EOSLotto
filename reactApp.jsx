
var Lottery;
var account;
var matches;
var appRoot = document.getElementById('app');
var predictions = [];

window.addEventListener('load', function() {
    // Check if Web3 has been injected by the browser:
    if (typeof web3 !== 'undefined') {
        // You have a web3 browser! Continue below!
        console.log(" Web3");
        startApp(web3);
    } else {
        console.log(" No Web3");
        // Warn the user that they need to get a web3 browser
        // Or install MetaMask, maybe with a nice graphic.
    }
})

function startApp(web3) {
    web3 = new Web3(web3.currentProvider);
    abi = JSON.parse('[{"constant":false,"inputs":[{"name":"home_teams","type":"bytes32[]"},{"name":"away_teams","type":"bytes32[]"},{"name":"match_kickoff_times","type":"uint256[]"}],"name":"kickoff_lotto","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"max_ticket_price","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"predictions","type":"uint256[]"}],"name":"make_bet","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"matches","outputs":[{"name":"home_team","type":"bytes32"},{"name":"away_team","type":"bytes32"},{"name":"time","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"}],"name":"transfer_amount","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"match_results","type":"uint256[]"}],"name":"select_winners","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"organiser","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"player_addresses","outputs":[{"name":"exists","type":"bool"},{"name":"index","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"addr","type":"address"}],"name":"fetch_player_prediction","outputs":[{"name":"","type":"uint256[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"x","type":"bytes32"}],"name":"bytes32ToString","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"fetch_players_count","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"min_ticket_price","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"fetch_matches_count","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"players","outputs":[{"name":"addr","type":"address"},{"name":"score","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"index","type":"uint256"}],"name":"fetch_match","outputs":[{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"shutdown","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_drawer","type":"address"},{"indexed":false,"name":"winning_number","type":"uint256"},{"indexed":false,"name":"num_winners","type":"uint256"}],"name":"Drawn","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_better","type":"address"},{"indexed":false,"name":"bet","type":"uint256"}],"name":"Betted","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"message","type":"string"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Message","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"addr","type":"address"}],"name":"EchoAddress","type":"event"}]');
    LotteryContract = web3.eth.contract(abi);
    Lottery = LotteryContract.at('0x7c2982e6f5ede0621a3901be41adfe9570e7020b');
}

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
}

function addMatch(){
	 var matchAdded = new CustomEvent('matchAdded', {
  			detail: { 
  				homeTeam: $('#homeTeamInput').val(),
  				awayTeam: $('#awayTeamInput').val(), 
  				time: $('#unixTimestampInput').val() }
	});
	window.dispatchEvent(matchAdded);
	$('#addMatchModal').modal('hide');

}

function saveMatchesToContract(){
	var homeTeams = [], awayTeams = [], matchTimes = [];
	for(var i=0;i<matches.length;i++){
		homeTeams.push(matches[i].homeTeam);
		awayTeams.push(matches[i].awayTeam);
		matchTimes.push(matches[i].time);
	}
	console.log(homeTeams);
	console.log(awayTeams);
	console.log(matchTimes);
	if(matches.length>0)
	Lottery.kickoff_lotto.sendTransaction(homeTeams,awayTeams,matchTimes,{from: web3.eth.accounts[0], gas: 4700000},function(err,result){});
}

function sendMatchResultsToContract(){
	Lottery.select_winners.sendTransaction(predictions,{from: web3.eth.accounts[0], gas: 4700000}, function(err,result){});
}

function showMatchModal(){
	$("#addMatchModal").modal();
}



function PredictionSlot(props) {
	var cellStyle={
		"backgroundColor":props.value,
	}
	return <td style={cellStyle} onClick={props.onClick}> </td>
} 

class MatchSlot extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			slots : [0 , 0, 0]
		}
	}

	componentDidMount() {
		this.setPrediction(this.props.prediction-1);
	}

	setPrediction(i) { 
		var slots = [0, 0, 0];
		slots[i]=1
		this.setState({slots:slots});
		predictions[this.props.match_key] = i;
	}

	draw(selected){
		//return selected? '#ccff18' : '#fff200';
		return selected? '#dc3545' : '#212529';
	}

	render() {
		return (
		<tr>
		    <td>{moment.unix(this.props.time).format("MMMM D - hh:mm A")}</td>
		    <td>{this.props.homeTeam}</td>
		    <td>{this.props.awayTeam}</td>

			{!this.props.isAdmin && this.state.slots.map((selected, i) => 
			   <PredictionSlot 
			     key={i}
			     value={this.draw(selected)}
			     onClick={() => this.setPrediction(i)} 
			    />		
			)} 
			{this.props.isAdmin &&
			<td style={{backgroundColor:'#212529'}}>
			 <button  onClick={() => this.props.removeMatch(this.props.match_key)} type="button" className="btn btn-sm btn-danger">DELETE</button> 
			</td>
			}
		</tr> 
		)
	}
}

class UserTableHeader extends React.Component {

	render() {
		return (
		  <tr>
	      <th scope="col">Kick Off</th>
	      <th scope="col">Home Team</th>
	      <th scope="col">Away Team</th>
	      <th scope="col">Home Win</th>
	      <th scope="col">Away Win</th>
	      <th scope="col">Draw</th>
	     </tr>
		)
	}
}

class AdminTableHeader extends React.Component {

	render() {
		return (
		  <tr>
	      <th scope="col">Kick Off</th>
	      <th scope="col">Home Team</th>
	      <th scope="col">Away Team</th>
	      <th scope="col">Action</th>
	     </tr>
		)
	}
}





class MatchTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            matches: []
        }
        this.matchAdded = this.matchAdded.bind(this);
        this.removeMatch = this.removeMatch.bind(this);
    }

    fetchMatches() {
        matches = [];
        var self = this;
        Lottery.fetch_matches_count.call(function(err, result) {
            if (result) {
                for (var i = 0; i < result.toNumber(); i++) {
                	Lottery.fetch_match(i, function(err,result) {
                		matches.push({
                			homeTeam:result[0],
                			awayTeam: result[1],
                		    time: result[2].toNumber(),
                		    prediction: null
                		});
                		self.setState({
                			matches: matches
                		});
                	});
                }
            }
        });
    }

    updatePrediction(key, prediction) {
    	this.setState({
  			matches: update(this.state.matches, {key: {prediction: {$set: prediction}}})
		 });
    }

    componentWillMount() {
	    web3 = new Web3(web3.currentProvider);
	    var abi = JSON.parse('[{"constant":false,"inputs":[{"name":"home_teams","type":"bytes32[]"},{"name":"away_teams","type":"bytes32[]"},{"name":"match_kickoff_times","type":"uint256[]"}],"name":"kickoff_lotto","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"max_ticket_price","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"predictions","type":"uint256[]"}],"name":"make_bet","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"matches","outputs":[{"name":"home_team","type":"bytes32"},{"name":"away_team","type":"bytes32"},{"name":"time","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"amount","type":"uint256"}],"name":"transfer_amount","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"match_results","type":"uint256[]"}],"name":"select_winners","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"organiser","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"player_addresses","outputs":[{"name":"exists","type":"bool"},{"name":"index","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"addr","type":"address"}],"name":"fetch_player_prediction","outputs":[{"name":"","type":"uint256[]"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"x","type":"bytes32"}],"name":"bytes32ToString","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"fetch_players_count","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"min_ticket_price","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"fetch_matches_count","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"players","outputs":[{"name":"addr","type":"address"},{"name":"score","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"index","type":"uint256"}],"name":"fetch_match","outputs":[{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"shutdown","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_drawer","type":"address"},{"indexed":false,"name":"winning_number","type":"uint256"},{"indexed":false,"name":"num_winners","type":"uint256"}],"name":"Drawn","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"_better","type":"address"},{"indexed":false,"name":"bet","type":"uint256"}],"name":"Betted","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"message","type":"string"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Message","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"addr","type":"address"}],"name":"EchoAddress","type":"event"}]');
	    var LotteryContract = web3.eth.contract(abi);
	    Lottery = LotteryContract.at('0x7c2982e6f5ede0621a3901be41adfe9570e7020b');
	    web3.eth.getAccounts(function(err, accs) {
		    if (err != null) {
		        alert("There was an error fetching your accounts.");
		        return;
		    }
		    if (accs.length == 0) {
		        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
		        return;
		    }
		    var accounts = accs;
		    account = accounts[0];
        });
        if (!this.props.isAdmin)
	    this.fetchMatches();
    }

    makeBet(betAmount) {
    	var price = web3.toWei(betAmount);
    	Lottery.make_bet.sendTransaction(predictions, { from: account, value: price, gas: 1000000 }, function(error, result) {
                if (error)
                    console.log(error);
                else
                    console.log(result);
            });
    }

    removeMatch(i) {
    	matches = this.state.matches;
    	matches.splice(i,1);
    	this.setState({matches:matches});
    }

    matchAdded(event){
    	matches = this.state.matches;
    	var match = event.detail;
    	matches.push(match);
    	this.setState({matches:matches});
    }

    componentDidMount(){
    	window.addEventListener('matchAdded', this.matchAdded);
    }

    componentWillUnMount(){
    	window.removeEventListener('matchAdded', this.matchAdded);
    }

    render() {

    	return (
    	
					<table className="table">
					  <thead className="thead-dark">
					    { this.props.isAdmin &&
					    	 <AdminTableHeader />
					    }
					    { !this.props.isAdmin && 
					    	 <UserTableHeader />
					    }
					  </thead>
					  <tbody>
					    {  this.state.matches.map((match, i) =>
						       <MatchSlot 
						           key={i} 
						           prediction={match.prediction} 
						           time={match.time}
						           homeTeam={match.homeTeam}
						           awayTeam={match.awayTeam}
						           match_key={i}
						           isAdmin={this.props.isAdmin}
						           removeMatch={this.removeMatch}
						       />
				     	)}
					  </tbody>
					</table>
				
		);

    }

}

class AddMatchControls extends React.Component {
	render() {
		return (
			<center>
				<br/><br/>
				<button type="button" className="btn btn-primary btn-lg" onClick={()=> showMatchModal()} style={{marginRight:30+'px',width:'25%'}}>  ADD MATCH </button> <br/><br/>
		  		<button type="button" className="btn btn-primary btn-lg" onClick={()=> saveMatchesToContract()} style={{marginRight:30+'px',width:'25%'}}>  COMMIT </button> <br/><br/>
		    </center>
	    );
	}
}

var userTemplate = (
    <div> 
		<nav className="navbar navbar-dark bg-dark">
		  <a className="navbar-brand" href="#"> 
		      SPORTS LOTTO</a>
			  <span className="navbar-text" style={{color:'white'}}> POT : 15 ETH</span>
		</nav>
        <MatchTable 
        	isAdmin={false}
        />
        <br/>
			<center>
			<br/><br/>
			<button type="button" onClick={()=> this.makeBet(0.1)} className="btn btn-danger btn-lg" style={{marginRight:30+'px',width:'25%'}}>  BET 0.1 ETH </button> <br/><br/>
			<button type="button"  onClick={()=> this.makeBet(0.5)} className="btn btn-danger btn-lg" style={{marginRight:30+'px',width:'25%'}}> BET 0.5 ETH</button>
			</center>
	</div>
	); 

var adminTemplate = (

	 <div> 
		<nav className="navbar navbar-expand-md navbar-dark bg-dark">
		  <a className="navbar-brand" href="#"> 
		      SPORTS LOTTO | ADMIN PANEL</a>
	<button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarColor01" aria-controls="navbarColor01" aria-expanded="true" aria-label="Toggle navigation">
      <span className="navbar-toggler-icon"></span>
    </button>

    <div className="collapse navbar-collapse" id="navbarColor01">
      <ul className="navbar-nav mr-auto">
        <li className="nav-item">
          <a className="nav-link" href="/">HOME</a>
        </li>
        <li className="nav-item active">
          <a className="nav-link" href="#">ADD MATCHES</a>
        </li>
        <li className="nav-item">
          <a className="nav-link" href="?user=admin&page=sendMatchResults">SEND RESULTS</a>
        </li>
      </ul>
		    </div>
		
			  <span className="navbar-text" style={{color:'white'}}> POT : 15 ETH</span>
		</nav>
        <MatchTable 
        	isAdmin={true}
        />
        <br/>
		<div className="modal" id="addMatchModal" tabIndex="-1" role="dialog" style={{color:'black'}}>
		  <div className="modal-dialog" role="document" >
		    <div className="modal-content">
		      <div className="modal-header">
		        <h5 className="modal-title">Add Match</h5>
		        <button type="button" className="close" data-dismiss="modal" aria-label="Close">
		          <span aria-hidden="true">&times;</span>
		        </button>
		      </div>
		      <div className="modal-body">
		       <form >
				  <div className="form-group">
				    <label htmlFor="homeTeamInput">Home Team</label>
				    <input type="text" className="form-control" id="homeTeamInput" placeholder="BOU" />
				  </div>
				  <div className="form-group">
				    <label htmlFor="awayTeamInput">Away Team</label>
				    <input type="text" className="form-control" id="awayTeamInput" placeholder="EVE" />
				  </div>
				  <div className="form-group">
				    <label htmlFor="unixTimestampInput">Kick Off </label>
				    <input type="text" className="form-control" id="unixTimestampInput" placeholder="1533103497" />
                    <small id="unixTimestampInput" className="form-text text-muted">Please enter the kick off time in unix timestamp format.</small>
				  </div>
				</form>

		      </div>
		      <div className="modal-footer">
		        <button type="button" onClick={()=> addMatch()} className="btn btn-primary">Save</button>
		      </div>
		    </div>
		  </div>
		</div>
		<center>
			<br/><br/>
			<AddMatchControls/>
	    </center>
	</div>

	)

var adminMatchResultsTemplate = (

	 <div> 
		<nav className="navbar navbar-expand navbar-dark bg-dark">
		  <a className="navbar-brand" href="#"> 
		      SPORTS LOTTO | ADMIN PANEL</a>

		      <div className="collapse navbar-collapse" id="navbarColor01">
			      <ul className="navbar-nav mr-auto">
			        <li className="nav-item">
			          <a className="nav-link" href="/">HOME</a>
			        </li>
			        <li className="nav-item">
			          <a className="nav-link" href="/?user=admin&page=addMatches">ADD MATCHES</a>
			        </li>
			        <li className="nav-item active">
			          <a className="nav-link" href="?user=admin&page=sendMatchResults">SEND RESULTS</a>
			        </li>
			      </ul>
		    </div>

			  <span className="navbar-text" style={{color:'white'}}> POT : 15 ETH</span>
		</nav>
        <MatchTable 
        	isAdmin={false}
        />
        <br/>
		<center>
			<br/><br/>
				<button type="button" className="btn btn-primary btn-lg" onClick={()=> sendMatchResultsToContract()} style={{marginRight:30+'px',width:'25%'}}>  SEND MATCH RESULTS </button> <br/><br/>
	    </center>
	</div>

	)


var user = getQueryVariable("user");
var page = getQueryVariable("page")
if(user=="admin") {
	page=="sendMatchResults" ? ReactDOM.render(adminMatchResultsTemplate,appRoot) : ReactDOM.render(adminTemplate,appRoot);
} else {
	ReactDOM.render(userTemplate,appRoot);
}




