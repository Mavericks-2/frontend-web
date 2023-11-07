import Navbar from "../components/Navbar";
import { Fragment, useEffect, useState } from "react";
import {
  getIntentosPrevAcomodo,
  getMatrizDiferencias,
  getFechasStatus,
} from "../services/StatusService";
import ColumnGraph from "../components/ColumnGraph";
import DashboardsStyle from "../styles/DashboardsStyle.css";
import PieGraph from "../components/PieGraph";
import LineGraph from "../components/LineGraph";
import GaugePlot from "../components/GaugePlot";

function DashboardPage() {
  const [intentosPrevAcomodoData, setIntentosPrevAcomodoData] = useState([]);
  const [matrizDiferenciaData, setMatrizDiferenciaData] = useState([]);
  const [fechasStatusData, setFechasStatusData] = useState([]);
  const [decimal, setDecimal] = useState(0);
  const [promedioIntentosMalos, setPromedioIntentosMalos] = useState(0);
  const [promProdFallidosResultado, setPromProdFallidosResultado] =
    useState(null);
  const matrizProdIncorrectos = [];

  useEffect(() => {
    getIntentosPrevAcomodo()
      .then((data) => {
        setIntentosPrevAcomodoData(data);
        setPromedioIntentosMalos(promedioIntentosInc(data));
      })
      .catch((error) => {
        console.error(
          "Error fetching number of attempts before correct placement: ",
          error
        );
      });
    getMatrizDiferencias()
      .then((data) => {
        setMatrizDiferenciaData(data);
      })
      .catch((error) => {
        console.error("Error fetching difference matrix: ", error);
      });
    getFechasStatus()
      .then((data) => {
        setFechasStatusData(data);
        setDecimal(calcularDecimal(data));
      })
      .catch((error) => {
        console.error("Error fetching status dates: ", error);
      });
    promProdFallidos.then((resultado) => {
        console.log("Resultado de promProdFallidos:", resultado);
      setPromProdFallidosResultado(resultado);
    });
  }, []);

  function formatFecha(fecha) {
    const parts = fecha.split("-");
    return `${parts[2]}/${parts[1]}`;
  }

  function contarUnosEnMatriz(matrices) {
    const matricesArray = JSON.parse(`[${matrices}]`);

    let contadorUnos = 0;

    matricesArray.forEach((matriz) => {
      matriz.forEach((fila) => {
        fila.forEach((elemento) => {
          if (elemento === 1) {
            contadorUnos++;
          }
        });
      });
    });
    matrizProdIncorrectos.push(contadorUnos);
    return contadorUnos;
  }

  function contarProductos(matricesProductosF) {
    const matricesProductosFArray = JSON.parse(`[${matricesProductosF}]`);
    const productoCount = {};
    matricesProductosFArray.forEach((matriz) => {
      if (Array.isArray(matriz)) {
        matriz.forEach((fila) => {
          if (Array.isArray(fila)) {
            fila.forEach((producto) => {
              if (productoCount[producto]) {
                productoCount[producto]++;
              } else {
                productoCount[producto] = 1;
              }
            });
          }
        });
      }
    });
    return productoCount;
  }

  const productosContados = contarProductos(
    matrizDiferenciaData.map((item) => item.matricesProductosF)
  );

  const productosContadosArray = Object.keys(productosContados).map(
    (producto) => ({
      producto: producto,
      count: productosContados[producto],
    })
  );

  function calcularDecimal(data) {
    const size = data.length;
    const correctos = data.reduce((contador, item) => {
      if (item.timestamp === 0) {
        contador++;
      }
      return contador;
    }, 0);
    return correctos / size;
  }

  function promedioIntentosInc(data) {
    const length = data.length;
    let intentosIncorrectos = 0;
    data.map((item) => {
      intentosIncorrectos += item.conteo;
    });
    return intentosIncorrectos / length;
  }
  const promProdFallidos = (async () => {
    while (matrizProdIncorrectos.length === 0) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    const total = matrizProdIncorrectos.reduce(
      (total, current) => total + current,
      0
    );
    console.log("prom", total / matrizDiferenciaData.length);
    return total / matrizDiferenciaData.length;
  })();

  return (
    <Fragment>
      <Navbar />
      {/*       <div className="container">
        <div className="row">
          <div className="col-12">
            <ul>
              {fechasStatusData.length > 0 ? (
                fechasStatusData.map((matriz, index) => (
                  <li key={index}>
                    <p>Primer acomodado: {matriz.timestamp}</p>
                    <p>
                      Primer desacomodado: {matriz.primerDesacomodado.estado}
                    </p>
                    <p>Fecha: {matriz.fecha}</p>
                  </li>
                ))
              ) : (
                <p>Cargando datos...</p>
              )}
            </ul>
          </div>
        </div>
      </div> */}
      <div className="dashboards-main-container">
        <div className="header">
          <p className="title">Visualización de dashboards</p>
        </div>

        <div className="dashboards-container">
          <div className="dashboards-item">
            <div className="dashboard-item-title">
              Número de intentos incorrectos
            </div>
            <ColumnGraph
              data={intentosPrevAcomodoData.map((item) => ({
                ...item,
                fecha: formatFecha(item.fecha),
              }))}
              xField={"fecha"}
              yField={"conteo"}
              color={"orange"}
            />
            <p>
              El promedio de intentos incorrectos es {promedioIntentosMalos}
            </p>
          </div>
          <div className="dashboards-item">
            <div className="dashboard-item-title">
              Número de productos fallidos
            </div>
            <LineGraph
              data={matrizDiferenciaData.map((item) => ({
                ...item,
                unos: contarUnosEnMatriz(item.matricesDiferencias),
                fecha: formatFecha(item.fecha),
              }))}
              xField={"fecha"}
              yField={"unos"}
            />
            <p>
              El promedio de productos fallidos es {promProdFallidosResultado}
            </p>
          </div>
          <div className="dashboards-item">
            <div className="dashboard-item-title">Productos fallidos</div>
            <PieGraph
              data={productosContadosArray}
              xField="producto"
              yField="count"
            />
          </div>
          <div className="dashboards-item">
            <div className="dashboard-item-title">
              Minutos entre el primer intento y el acomodo correcto
            </div>
            <ColumnGraph
              data={fechasStatusData
                .map((item) => ({
                  ...item,
                  fecha: formatFecha(item.fecha),
                  timestamp: item.timestamp.toFixed(1),
                }))
                .sort((a, b) => a.timestamp - b.timestamp)}
              xField={"fecha"}
              yField={"timestamp"}
              color={"#8B0000"}
            />
          </div>
          <div className="dashboards-item">
            <div className="dashboard-item-title">
              Porcentaje de acomodos a la primera
            </div>
            <GaugePlot data={decimal} />
          </div>
        </div>
      </div>
    </Fragment>
  );
}

export default DashboardPage;