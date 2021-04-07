import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { absoluteUrl } from '../utils/utils';
import React from 'react';
import { Line } from 'react-chartjs-2';

export async function getServerSideProps({ req }) {
  const { origin } = absoluteUrl(req, 'localhost:3000');
  const url = `${origin}/api/get?API_KEY=${process.env.API_KEY}`;

  const res = await fetch(url);
  const data = await res.json();

  return {
    props: {
      data,
    },
  };
}

export default class Home extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const data = {
      labels: this.props.data.map((item) => item.date),
      datasets: [
        {
          label: '# 1. Doz Aşı Sayısı',
          data: this.props.data.map((item) => item.number),
          fill: false,
          backgroundColor: 'rgb(255, 99, 132)',
          borderColor: 'rgba(255, 99, 132, 0.2)',
        },
        {
          label: '# 2. Doz Aşı Sayısı',
          data: this.props.data.map((item) => item.number2),
          fill: false,
          backgroundColor: 'rgb(54, 162, 235)',
          borderColor: 'rgba(54, 162, 235, 0.2)',
        },
      ],
    };

    const options = {
      scales: {
        yAxes: [
          {
            ticks: {
              callback(value) {
                return Number(value).toLocaleString('en');
              },
            },
          },
        ],
      },
      hover: {
        mode: 'nearest',
        intersect: true,
      },
      responsive: true,
      tooltips: {
        mode: 'index',
        intersect: false,
      },
      spanGaps: true,
      showLine: false,
      datasets: {
        line: {
          pointRadius: 0,
        },
      },
      elements: {
        point: {
          radius: 0,
        },
      },
    };

    return (
      <div className={styles.container}>
        <Head>
          <title>🇹🇷 Türkiye Covid 19 Aşı İstatistiği</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>

        <main className={styles.main}>
          <h1 className={styles.title}>🇹🇷 Türkiye Covid 19 Aşı İstatistiği</h1>

          <Line options={options} data={data} width={100} height={50} />
        </main>

        <footer className={styles.footer}>
          <div>
            {new Date().getFullYear()} -{' '}
            <a href="https://ibrahimmumcu.com" target="_blank">
              Ibrahim Mumcu
            </a>
          </div>
          <div>
            Veriler belirli aralıklarla otomatik olarak&nbsp;
            <a href="https://covid19asi.saglik.gov.tr/" target="_blank">
              Sağlık Bakanlığı
            </a>
            'ndan alınmaktadır. Kaynak kodlarına&nbsp;
            <a
              href="https://github.com/ibrahimmumcu/tr-vaccine"
              target="_blank"
            >
              Github
            </a>
            &nbsp;üzerinden ulaşabilirsiniz.
          </div>
          <div>
            Not: Servisin başlangıç tarihi 20 Ocak 2021'dir. Bu tarihten önceki
            veriler başka kaynaklardan alınmıştır.
          </div>
        </footer>
      </div>
    );
  }
}
