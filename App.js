import React, { useEffect, useState, useRef } from 'react';
import { SafeAreaView, FlatList, RefreshControl, Image, StatusBar, StyleSheet, Text, useColorScheme, View, Dimensions } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider, TouchableRipple } from 'react-native-paper';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Appbar, Card, Searchbar } from 'react-native-paper';
import RBSheet from "react-native-raw-bottom-sheet";
import { AirbnbRating } from 'react-native-ratings';

const dWidth = Dimensions.get('window').width;
const dHeight = Dimensions.get('window').height;

const ProgressiveImageComponent = (props) => {
  const [showDefault, setShowDefault] = useState(true);
  const [error, setError] = useState(false);

  var image = showDefault ? require('./assets/noodles.png') : (error ? require('./assets/warning.png') : { uri: props.uri });
  return (
    <Image style={props.style}
      source={image}
      onLoadEnd={() => setShowDefault(false)}
      onError={(err) => { setError(true) }}
      resizeMode={props.resizeMode} />
  );
}


const DetailScreen = (props) => {

  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = { flex: 1, backgroundColor: isDarkMode ? '#000000' : '#ffffff' };

  const [isLoading, setLoading] = useState(true);
  const [noodleData, setNoodleData] = useState([]);
  const [filterNoodleData, setFilterNoodleData] = useState([]);

  const [noodleImageData, setNoodleImageData] = useState([]);

  const [searchQuery, setSearchQuery] = React.useState('');
  const onChangeSearch = query => {
    setSearchQuery(query)
    if (query != '') {
      let tempData = []
      tempData = noodleData.filter((item) => {
        const itemData = `${item.Brand.trim().toUpperCase()} `;
        const textData = query.toUpperCase();
        return itemData.indexOf(textData) > -1;
      });
      setFilterNoodleData(tempData)
    } else {
      setFilterNoodleData(noodleData)
    }
  };

  const bsRef = useRef();

  const sortByAscending = () => {
    setLoading(true)
    let tempA = [...filterNoodleData];
    const sorter1 = (a, b) => a.Stars.toString().toLowerCase() > b.Stars.toString().toLowerCase() ? 1 : -1;
    tempA.sort(sorter1);
    setFilterNoodleData(tempA)
    setLoading(false)
  }

  const sortByDescending = () => {
    setLoading(true)
    let tempdD = [...filterNoodleData];
    const sorter2 = (a, b) => a.Stars.toString().toLowerCase() > b.Stars.toString().toLowerCase() ? -1 : 1;
    tempdD.sort(sorter2);
    setFilterNoodleData(tempdD)
    setLoading(false)

  }


  const getDataFromApi = async () => {
    setLoading(true)
    setNoodleData([])

    let noodleImageResponse = await fetch('https://accubits-image-assets.s3.ap-southeast-1.amazonaws.com/john/noodlesec253ad.json');
    let noodleImageJson = await noodleImageResponse?.json();
    setNoodleImageData(noodleImageJson)

    let noodleResponse = await fetch('https://accubits-image-assets.s3.ap-southeast-1.amazonaws.com/john/TopRamen8d30951.json');
    let noodleJson = await noodleResponse?.json();
    setNoodleData(noodleJson)
    setFilterNoodleData(noodleJson)
    setLoading(false)
  };

  useEffect(() => { getDataFromApi(); }, []);

  const _renderItem = ({ item, index }) => {
    return (<Card style={{ margin: 6 }}>
      <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center' }}>
        <ProgressiveImageComponent style={{ width: 120, height: '100%' }}
          uri={noodleImageData[Math.floor(Math.random() * noodleImageData?.length)]?.Image}
          resizeMode='cover' />
        <View style={{ width: dWidth - 160, padding: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{item?.Variety}</Text>
          <Text style={{ fontSize: 13, }}>{item?.Brand}</Text>
          <Text style={{ fontSize: 11, }}>{item?.Country}</Text>

          <AirbnbRating
            count={5}
            defaultRating={item?.Stars == 'NAN' ? 0 : item?.Stars}
            size={10}
            isDisabled={true}
            reviewSize={0}
            starContainerStyle={{ alignSelf: 'flex-end' }}
          />
        </View>
      </View>
    </Card>)
  }

  const _renderItemSeperator = () => { return (<View style={{ height: 4 }} />); }

  const _renderEmptyComponent = ({ item }) => {
    return (
      <View style={{ width: '100%', height: dHeight - 100, justifyContent: 'center', alignItems: 'center' }}>
        <Image style={{ height: 150, width: 150 }} source={isLoading ? require('./assets/meal.png') : require('./assets/food.png')} />
        <Text style={{ fontWeight: 'bold', fontSize: 14 }}>{isLoading ? 'Fetching Items' : 'No Items Found'}</Text>
      </View>
    );
  };

  const renderHeader = () => {
    return (
      <Appbar.Header>
        <Searchbar
          placeholder="Search"
          onChangeText={onChangeSearch}
          value={searchQuery}
          style={{ width: '90%' }}
        />
        <Appbar.Action icon="dots-vertical" onPress={() => bsRef.current.open()} />
      </Appbar.Header>
    )
  }

  const renderRBSHeet = () => {
    return (<View>
      <RBSheet
        ref={bsRef}
        height={200}
        openDuration={250}
        closeOnDragDown={true}
        closeOnPressMask={true}
        customStyles={{ container: { backgroundColor: isDarkMode ? '#404241' : '#ffffff', justifyContent: "flex-start", alignItems: "flex-start" }, draggableIcon: { backgroundColor: "#fff" } }}      >
        <View>
          <TouchableRipple style={{ height: 50, padding: 4 }} onPress={() => { bsRef.current.close(); sortByAscending(); }}>
            <Text style={{ marginLeft: 10, fontWeight: 'bold', fontSize: 14 }}>Sort by rating Ascending</Text>
          </TouchableRipple>
          <TouchableRipple style={{ height: 50, padding: 4 }} onPress={() => { bsRef.current.close(); sortByDescending() }}>
            <Text style={{ marginLeft: 10, fontWeight: 'bold', fontSize: 14 }}>Sort by rating Descending</Text>
          </TouchableRipple>
        </View>
      </RBSheet>
    </View>)
  }

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      {renderHeader()}
      {renderRBSHeet()}
      <View style={[backgroundStyle, { padding: 8 }]}>
        <FlatList
          data={filterNoodleData || []}
          renderItem={_renderItem}
          keyExtractor={(renderItem, index) => index.toString()}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={getDataFromApi} />}
          ListEmptyComponent={_renderEmptyComponent}
          ItemSeparatorComponent={_renderItemSeperator}
        />
      </View>
    </SafeAreaView>
  );
}

const HomeScreen = (props) => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = { flex: 1, backgroundColor: isDarkMode ? '#000000' : '#ffffff', justifyContent: 'center', alignItems: 'center', };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <View style={backgroundStyle}>
        <Image style={{ height: 250, width: 250 }} source={require('./assets/ramenRes.png')} />
        <View style={{ margin: 10 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 18 }}>Welcome to,</Text>
          <Text style={{ fontWeight: 'bold', fontSize: 35 }}>Ramen Restaurant</Text>
        </View>
        <TouchableRipple onPress={() => props?.navigation.navigate('Detail')} style={{ width: 120, height: 50, alignItems: 'center', justifyContent: 'center', backgroundColor: 'green', margin: 50 }}>
          <Text>Enter</Text>
        </TouchableRipple>
      </View>
    </SafeAreaView>
  );
}

const App = () => {
  const Stack = createNativeStackNavigator();
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Detail" component={DetailScreen} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

export default App;
