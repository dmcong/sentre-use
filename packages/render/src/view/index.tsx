import { useCallback, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useWallet, createPDB } from '@sentre/senhub'
import { MintSelection } from '@sen-use/components'

import { Row, Col, Typography, Button, Space } from 'antd'
import IonIcon from '@sentre/antd-ionicon'

import { AppDispatch, AppState } from 'model'
import { increaseCounter } from 'model/main.controller'
import configs from 'configs'
import { NFTSelection } from './NFT'
import { searchNFTType } from './NFT/NFTSelection'

const {
  manifest: { appId },
} = configs

const View = () => {
  const {
    wallet: { address },
  } = useWallet()
  const dispatch = useDispatch<AppDispatch>()
  const { counter } = useSelector((state: AppState) => state.main)

  const pdb = useMemo(() => createPDB(address, appId), [address])
  const increase = useCallback(() => dispatch(increaseCounter()), [dispatch])
  useEffect(() => {
    if (pdb) pdb.setItem('counter', counter)
  }, [pdb, counter])
  const onSelectNFT = (mintAddress: string) => {
    console.log('Address: ', mintAddress)
  }

  return (
    <Row gutter={[24, 24]} align="middle">
      <Col span={24}>
        <Space align="center">
          <IonIcon name="newspaper-outline" />
          <Typography.Title level={4}>App View</Typography.Title>
        </Space>
      </Col>
      <Col span={24}>
        <Typography.Text>Address: {address}</Typography.Text>
      </Col>
      <Col>
        <Typography.Text>Counter: {counter}</Typography.Text>
      </Col>
      <Col>
        <Button onClick={increase}>Increase</Button>
      </Col>
      <MintSelection />
      <NFTSelection
        collectionAddress="3NKWipp36DnCyQk2LQmXbret2U2M816GWBCvHQAaMyFT"
        onSelect={onSelectNFT}
      />
      <NFTSelection
        searchNFTby={searchNFTType.collections}
        title="Select NFT collection"
        onSelect={onSelectNFT}
      />
    </Row>
  )
}

export default View
