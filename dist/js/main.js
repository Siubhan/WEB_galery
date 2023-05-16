let venoBox = new VenoBox({
	selector: ".my-link",
});
venoBox.next();


function getDataTable() {
	let data = [];
	let table = document.getElementById('table');
	let rows = table.querySelector('tbody').querySelectorAll('tr');
	for (let i = 0; i < rows.length; i++) {
		let cells = rows[i].cells;
		let arr = [];
		for (let j = 0; j < cells.length; j++) {
			arr.push(cells[j].innerHTML);
			if ((j + 1) % cells.length === 0) {
				data.push(arr);
			}
		}
	}
	return data;
}


function change(k, p, tableData) {
	let w = tableData[k];
	tableData[k] = tableData[p];
	tableData[p] = w;
}


function doCompare(element1, element2, sortOrder) {
	if (isNaN(parseFloat(element1)) || !isFinite(element1)) {
		let a = element1.localeCompare(element2);
		if (sortOrder) {
			if (a === -1) {
				return -1;
			} else if (a === 1) {
				return 1;
			} else {
				return 0;
			}
		} else {
			if (a === -1) {
				return 1;
			} else if (a === 1) {
				return -1;
			} else {
				return 0;
			}
		}
	} else {
		let e1 = Number(element1);
		let e2 = Number(element2);
		if (sortOrder) {
			if (e1 < e2) {
				return 1;
			} else if (e1 > e2) {
				return -1;
			} else {
				return 0;
			}
		} else {
			if (e1 < e2) {
				return -1;
			} else if (e1 > e2) {
				return 1;
			} else {
				return 0;
			}
		}
	}
}


function isCompareOrder(arrCompare, first, second) {
	for (let k = 0; k < arrCompare.length; k += 2) {
		let f = doCompare(first[arrCompare[k]], second[arrCompare[k]], arrCompare[k + 1]);
		if (f === 1) {
			return true;
		} else if (f === 0) {
			// переходим к сравнению следующего поля
		} else {
			return false;
		}
	}
}


function sort(arr) {
	let tableData = getDataTable();
	let n = tableData.length;
	for (let i = 0; i < n - 1; i++) {
		let flag = true;
		for (let j = 0; j < n - i - 1; j++) {
			if (isCompareOrder(arr, tableData[j], tableData[j + 1])) {
				change(j, j + 1, tableData);
				flag = false;
			}
		}
		if (flag) {
			break;
		}
	}
	return tableData;
}


function printTable(tableData) {
	let table = document.getElementById('table');
	let rows = table.querySelector('tbody').querySelectorAll('tr');
	for (let i = 0; i < rows.length; i++) {
		let cells = rows[i].cells;
		if (tableData[i] === undefined) {
			rows[i].parentElement.removeChild(rows[i]);

		} else {
			for (let j = 0; j < cells.length; j++) {
				cells[j].innerHTML = tableData[i][j];
			}
		}
	}
}


function howSortTable(sortFirst, descFirst, sortSecond, descSecond, sortThird, descThird) {
	let rightArr = [];

	if (+sortFirst === 0) {
		alert('Выберите первый уровень сортировки!');
	} else {
		rightArr.push(+sortFirst - 1);
		rightArr.push(descFirst);

		if (+sortSecond !== 0) {
			if (+sortFirst !== +sortSecond) {
				rightArr.push(+sortSecond - 1);
				rightArr.push(descSecond);
			} else {
				alert('Второй уровень сортировки не должен совпадать с первым!');
				return;
			}
		}

		if (+sortThird !== 0) {
			if (+sortSecond !== 0) {
				if (+sortThird !== +sortFirst && +sortThird !== +sortSecond) {
					rightArr.push(+sortThird - 1);
					rightArr.push(descThird);
				} else {
					alert('Третий уровень не должен совпадать с первым и вторым уровнями!');
					return;
				}
			} else {
				alert('Выберите второй уровень сортировки');
				return;
			}
		}
	}
	printTable(sort(rightArr));
}


function getDataForGraphic() {
	let data = getDataTable();
	let dataForGraph = {};
	let n = data.length;

	for (let i = 0; i < n; i++) {
		if (!Object.keys(dataForGraph).includes(data[i][4])) {
			dataForGraph[Number(data[i][4])] = [];
		}
		dataForGraph[Number(data[i][4])].push(Number(data[i][5]));

	}
	return dataForGraph;
}


function buildChart(ox, oy) {
	if (!ox || !oy) {
		alert("Выберите значения осей для графика");
		return;
	}

	if (document.querySelector("svg") !== null) {
		document.querySelector("svg").remove();
	}

	let data = getDataForGraphic();

	for (let i in data) {
		let sum = 0;
		for (let j = 0; j < data[i].length; j++) {
			sum += Number(data[i][j]);
		}
		data[i] = sum;
	}

	let dataFG = [];
	let o;
	for (let i in data) {
		o = {};
		o["name"] = i;
		o["score"] = data[i];
		dataFG.push(o);
		// alert(i+' '+data[i]);
	}

	let height = 500,
		width = 500,
		margin = 30;

	// функция для получения цветов
	let color = d3.scale.category10();

	// длина оси X= ширина контейнера svg - отступ слева и справа
	let xAxisLength = width - 2 * margin;

	// длина оси Y = высота контейнера svg - отступ сверху и снизу
	let yAxisLength = height - 2 * margin;

	// функция интерполяции значений на ось X
	let xScale = d3.scale.ordinal()
		.rangeRoundBands([0, xAxisLength + margin], .1)
		.domain(dataFG.map(function (d) {
			return d.name;
		}));

	// функция интерполяции значений на ось Y
	let yScale = d3.scale.linear()
		.domain([
                d3.min(dataFG, function (d) {
				return d.score;
			}),
                d3.max(dataFG, function (d) {
				return d.score;
			})
        ])
		.range([yAxisLength, 0]);

	let svg = d3.select(".chart").append("svg")
		.attr("class", "axis")
		.attr("width", width)
		.attr("height", height);

	// создаем ось X   
	let xAxis = d3.svg.axis()
		.scale(xScale)
		.orient("bottom");
	// создаем ось Y             
	var yAxis = d3.svg.axis()
		.scale(yScale)
		.orient("left");

	// отрисовка оси Х             
	svg.append("g")
		.attr("class", "x-axis")
		.attr("transform",
			"translate(" + margin + "," + (height - margin) + ")")
		.call(xAxis);

	// отрисовка оси Y 
	svg.append("g")
		.attr("class", "y-axis")
		.attr("transform",
			"translate(" + margin + "," + margin + ")")
		.call(yAxis);

	svg.append("g")
		.attr("transform", // сдвиг оси вправо
			"translate(" + margin + ", 0)")
		.selectAll(".bar")
		.data(dataFG)
		.enter().append("rect")
		.attr("class", "bar")
		.attr("x", function (d) {
			return xScale(d.name);
		})
		.attr("width", xScale.rangeBand())
		.attr("y", function (d) {
			return yScale(d.score) - 30;
		})
		.attr("height", function (d) {
			return height - yScale(d.score);
		})
		.attr("fill", function (d) {
			return color(d.name);
		});
}


const indexAuthor = 0;
const indexGenre = 2;



function getFilterTable() {
    let data = [];
    let tableData = getDataTable();
    for (let i = 0; i < tableData.length; i++) {
        let flag = true;
        for (let j = 1; j < arguments.length && flag; j += 2) {
            if (tableData[i][arguments[j]] !== arguments[j - 1]) {
                flag = false;
            }
        }

        if (flag) {
            data.push(tableData[i]);
        }
    }
    return data;
}


function filterTable(param1, param2) {
    if (param1 === '' && param2 === '') {
		return;
    }
    let data;
    if (param1 === '' && param2 !== '') {
        data = getFilterTable(param2, indexGenre);
    } else if (param1 !== '' && param2 === '') {
        data = getFilterTable(param1, indexAuthor);
    } else {
        data = getFilterTable(param1, indexAuthor, param2, indexGenre);
    }

    if (data.param2 === 0) {
        alert('Записей не найдено');
    } else {
        printTable(data);
    }
}