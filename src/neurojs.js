/** Neural Network constructor */
function Net (receptors) {
	this.nodes = receptors
	this.receptors = receptors
	this.neurons = []
}

/** Learninig phase */
Net.prototype.learn = function (sampleData) {
	var dendritesCount = 0 // just for stats
	var i

	// extract all possible conclusions
	var possibleConclusions = {}
	for (i in sampleData) {
		var conclusion = sampleData[i].conclusion || sampleData[i]
		possibleConclusions[conclusion] = true
	}

	// create final neurons
	for (i in possibleConclusions) {
		var neuron = new Neuron(this.nodes, i.conclusion || i)
		neuron.isFinalNode = true
		this.nodes.push(neuron)
		this.neurons.push(neuron)
		dendritesCount += neuron.dendrites.length
	}

	console.log ("Net initialized: " + this.receptors.length + " receptors, " + this.neurons.length + " neurons with " + dendritesCount + " dendrites total")

	// learn
	var sampleData_length = 0
	for (i in sampleData) {
		sampleData_length++
	}

	for (i in sampleData) {
		this.process(i)
		this.getNeuronByName(sampleData[i].conclusion || sampleData[i]).learn(sampleData[i].weight || 1, sampleData_length)
	}
	console.log("Learning finished: " + sampleData_length + " samples")
}

/** Processing (work) phase */
Net.prototype.process = function (data) {
	var results = []
	var i

	// clear cached results
	for (i = 0; i < this.neurons.length; i++) {
		this.neurons[i].refresh()
	}

	// trigger process() for all neurons and collect results
	for (i = 0; i < this.neurons.length; i++) {
		var result = this.neurons[i].process(data)
		if (this.neurons[i].name) {
			results.push({conclusion: this.neurons[i].name, score: result})
		}
	}

	return results
}

/** (helper function) */
Net.prototype.getNeuronByName = function (name) {
	var i

	for (i = 0; i < this.neurons.length; i++) {
		if (this.neurons[i].name == name) {
			return this.neurons[i]
		}
	}
}



function Receptor (receptionFunction, name) {
	this.receptionFunction = receptionFunction
	this.name = name
	this.sum = 0
	this.alreadyProcessed = false
}

/** Clear cache, and reset summator to zero */
Receptor.prototype.refresh = function () {
	this.sum = 0
	this.alreadyProcessed = false
}

/** Collect data from source */
Receptor.prototype.process = function (data) {
	if (!this.alreadyProcessed) {
		this.sum = this.receptionFunction(data)
		this.alreadyProcessed = true
	}
	return this.sum
}



function Neuron (nodes, name) {
	this.dendrites = []
	this.name = name || null
	this.sum = 0
	this.alreadyProcessed = false

	// connect to all prev nodes except fianl ones
	for (var i = 0; i < nodes.length; i++) {
		if (!nodes[i].isFinalNode) {
			this.dendrites.push({
				k: 0,
				node: nodes[i]
			})
		}
	}
}

/**
 * Learning phase
 * @todo Support for middle layers
 * @todo Redesign function arguments
 */
Neuron.prototype.learn = function (weight, total) {
	for (var i = 0; i < this.dendrites.length; i++) {
		this.dendrites[i].k += this.dendrites[i].node.sum ? 100*weight/total : 0
	}
}

/** Clear cache, and reset summator to zero */
Neuron.prototype.refresh = function () {
	this.sum = 0
	this.alreadyProcessed = false

	// pass refresh() to upper layers
	for (var i = 0; i < this.dendrites.length; i++) {
		this.dendrites[i].node.refresh()
	}
}

/** */
Neuron.prototype.process = function (data) {
	if (!this.alreadyProcessed) {
		for (var i = 0; i < this.dendrites.length; i++) {
			this.sum += this.dendrites[i].node.process(data) * this.dendrites[i].k
		}
		this.alreadyProcessed = true
	}

	return this.sum
}